import { parseStringPromise, Builder } from 'xml2js';

export interface PacketAttributes {
  number: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  addressId: string;
  cod?: number;
  value: number;
  weight?: number;
  eshop: string;
}

export interface PacketaResponse {
  id?: string;
  barcode?: string;
  status?: {
    codeText?: string;
    name?: string;
  };
  fault?: {
    string?: string;
    detail?: any;
  };
}

export type PacketaErrorCode = 
  | 'INCORRECT_API_PASSWORD'
  | 'INVALID_ATTRIBUTES'
  | 'CONNECTION_ERROR'
  | 'UNKNOWN_ERROR';

function logPacketaInfo(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [PACKETA-API] ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
}

function logPacketaError(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [PACKETA-API] ERROR: ${message}`, data !== undefined ? JSON.stringify(data, null, 2) : '');
}

export class PacketaAPIError extends Error {
  public errorCode: PacketaErrorCode;
  public userFriendlyMessage: string;

  constructor(
    message: string,
    public detail?: any,
    errorCode?: PacketaErrorCode
  ) {
    super(message);
    this.name = 'PacketaAPIError';
    this.errorCode = errorCode || this.detectErrorCode(message, detail);
    this.userFriendlyMessage = this.getUserFriendlyMessage(this.errorCode);
    
    logPacketaError(`PacketaAPIError created`, {
      technicalMessage: message,
      errorCode: this.errorCode,
      userFriendlyMessage: this.userFriendlyMessage,
      detail: detail
    });
  }

  private detectErrorCode(message: string, detail?: any): PacketaErrorCode {
    const lowerMessage = message.toLowerCase();
    const detailString = detail ? JSON.stringify(detail).toLowerCase() : '';
    
    if (lowerMessage.includes('incorrect api password') || 
        lowerMessage.includes('špatné api heslo') ||
        lowerMessage.includes('neplatné api heslo') ||
        detailString.includes('incorrect api password') ||
        detailString.includes('špatné api heslo') ||
        detailString.includes('neplatné api heslo')) {
      return 'INCORRECT_API_PASSWORD';
    }
    
    if (lowerMessage.includes('invalid') || 
        lowerMessage.includes('attribute') ||
        lowerMessage.includes('neplatný') ||
        detailString.includes('invalid') ||
        detailString.includes('attribute')) {
      return 'INVALID_ATTRIBUTES';
    }
    
    if (lowerMessage.includes('connection') || 
        lowerMessage.includes('network') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('econnrefused') ||
        lowerMessage.includes('enotfound')) {
      return 'CONNECTION_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  private getUserFriendlyMessage(errorCode: PacketaErrorCode): string {
    switch (errorCode) {
      case 'INCORRECT_API_PASSWORD':
        return 'Zásilkovna API heslo není správně nakonfigurováno. Kontaktujte podporu. (Poznámka: REST API heslo je odlišné od Widget API klíče)';
      case 'INVALID_ATTRIBUTES':
        return 'Neplatné údaje pro vytvoření zásilky. Zkontrolujte prosím zadané informace.';
      case 'CONNECTION_ERROR':
        return 'Chyba při komunikaci se Zásilkovnou. Zkuste to prosím znovu.';
      case 'UNKNOWN_ERROR':
      default:
        return 'Chyba při komunikaci se Zásilkovnou. Zkuste to prosím znovu.';
    }
  }
}

export class PacketaAPI {
  private apiUrl = 'https://www.zasilkovna.cz/api/rest';
  private apiPassword: string;

  constructor(apiPassword: string) {
    if (!apiPassword) {
      throw new Error('Packeta API password is required');
    }
    this.apiPassword = apiPassword;
  }

  private async callAPI(method: string, data: any): Promise<any> {
    const builder = new Builder({
      rootName: method,
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });

    const requestBody = {
      apiPassword: this.apiPassword,
      ...data,
    };

    const xml = builder.buildObject(requestBody);
    
    logPacketaInfo(`Calling Packeta API method: ${method}`, {
      method,
      dataKeys: Object.keys(data)
    });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xml,
      });

      const responseText = await response.text();
      
      logPacketaInfo(`Packeta API response received`, {
        method,
        status: response.status,
        statusText: response.statusText,
        responseLength: responseText.length
      });

      if (!response.ok) {
        logPacketaError(`Packeta API HTTP error`, {
          method,
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText.substring(0, 500)
        });
        throw new PacketaAPIError(
          `API request failed with status ${response.status}`,
          { status: response.status, responseText: responseText.substring(0, 500) }
        );
      }

      const parsedResponse = await parseStringPromise(responseText, {
        explicitArray: false,
        mergeAttrs: true,
      });

      const rootKey = Object.keys(parsedResponse)[0];
      const result = parsedResponse[rootKey];

      if (result.fault || result.string) {
        const errorMessage = result.string || result.fault?.string || 'API returned an error';
        const errorDetail = result.fault?.detail || result;
        
        logPacketaError(`Packeta API returned error`, {
          method,
          errorMessage,
          fault: result.fault,
          fullResponse: result
        });
        
        throw new PacketaAPIError(errorMessage, errorDetail);
      }
      
      logPacketaInfo(`Packeta API call successful`, { method, resultKeys: Object.keys(result) });

      return result;
    } catch (error) {
      if (error instanceof PacketaAPIError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logPacketaError(`Packeta API call failed with unexpected error`, {
        method,
        errorType: error?.constructor?.name,
        errorMessage,
        error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error
      });
      
      throw new PacketaAPIError(
        `Failed to call Packeta API: ${errorMessage}`,
        error,
        'CONNECTION_ERROR'
      );
    }
  }

  async createPacket(attributes: PacketAttributes): Promise<{ id: string; barcode: string }> {
    try {
      const nameParts = attributes.name.split(' ');
      const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const firstName = nameParts[0];

      const packetData = {
        packetAttributes: {
          number: attributes.number,
          name: firstName,
          surname: surname || attributes.surname,
          email: attributes.email,
          phone: attributes.phone,
          addressId: attributes.addressId,
          value: attributes.value,
          weight: attributes.weight || 1,
          eshop: attributes.eshop || 'UFOSport',
        },
      };

      if (attributes.cod && attributes.cod > 0) {
        packetData.packetAttributes = {
          ...packetData.packetAttributes,
          cod: attributes.cod,
        } as any;
      }

      const response = await this.callAPI('createPacket', packetData);

      if (!response.id) {
        throw new PacketaAPIError('No packet ID returned from API', response);
      }

      return {
        id: String(response.id),
        barcode: String(response.barcode || ''),
      };
    } catch (error) {
      console.error('Error creating Packeta packet:', error);
      throw error;
    }
  }

  async packetStatus(packetId: string): Promise<PacketaResponse> {
    try {
      const response = await this.callAPI('packetStatus', {
        packetId: packetId,
      });

      return response;
    } catch (error) {
      console.error('Error fetching Packeta packet status:', error);
      throw error;
    }
  }

  async packetTracking(packetId: string): Promise<string | null> {
    try {
      const status = await this.packetStatus(packetId);
      
      if (status.status?.codeText) {
        return status.status.codeText;
      }

      return null;
    } catch (error) {
      console.error('Error fetching Packeta tracking:', error);
      return null;
    }
  }

  async packetAttributesValid(attributes: PacketAttributes): Promise<boolean> {
    try {
      const packetData = {
        packetAttributes: {
          number: attributes.number,
          name: attributes.name,
          surname: attributes.surname,
          email: attributes.email,
          phone: attributes.phone,
          addressId: attributes.addressId,
          value: attributes.value,
          weight: attributes.weight || 1,
          eshop: attributes.eshop || 'UFOSport',
        },
      };

      await this.callAPI('packetAttributesValid', packetData);
      return true;
    } catch (error) {
      console.error('Packet attributes validation failed:', error);
      return false;
    }
  }
}

export function createPacketaClient(apiPassword?: string): PacketaAPI {
  const password = apiPassword || process.env.PACKETA_API_PASSWORD;
  
  if (!password) {
    throw new Error('Packeta API password not configured');
  }

  return new PacketaAPI(password);
}
