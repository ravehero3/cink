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

export class PacketaAPIError extends Error {
  constructor(
    message: string,
    public detail?: any
  ) {
    super(message);
    this.name = 'PacketaAPIError';
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

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xml,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new PacketaAPIError(
          `API request failed with status ${response.status}`,
          responseText
        );
      }

      const parsedResponse = await parseStringPromise(responseText, {
        explicitArray: false,
        mergeAttrs: true,
      });

      const rootKey = Object.keys(parsedResponse)[0];
      const result = parsedResponse[rootKey];

      if (result.fault || result.string) {
        throw new PacketaAPIError(
          result.string || 'API returned an error',
          result
        );
      }

      return result;
    } catch (error) {
      if (error instanceof PacketaAPIError) {
        throw error;
      }
      throw new PacketaAPIError(
        `Failed to call Packeta API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
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
