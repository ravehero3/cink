'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Video, Search, Filter, RefreshCw } from 'lucide-react'

interface Media {
  id: string
  filename: string
  originalName: string
  url: string
  publicId: string
  resourceType: 'IMAGE' | 'VIDEO'
  format: string | null
  size: number
  width: number | null
  height: number | null
  duration: number | null
  tags: string[]
  category: string | null
  description: string | null
  createdAt: string
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL')
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)

  useEffect(() => {
    fetchMedia()
  }, [filterType])

  const handleSyncCloudinary = async () => {
    if (syncing) return
    
    try {
      setSyncing(true)
      setSyncStatus('Syncing from Cloudinary...')
      
      const response = await fetch('/api/media/sync-cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSyncStatus(`Sync complete: ${result.imported} imported, ${result.skipped} already existed`)
        fetchMedia()
      } else {
        setSyncStatus(`Sync failed: ${result.error || 'Unknown error'}`)
      }
      
      setTimeout(() => setSyncStatus(null), 5000)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('Sync failed: Network error')
      setTimeout(() => setSyncStatus(null), 5000)
    } finally {
      setSyncing(false)
    }
  }

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType !== 'ALL') params.set('type', filterType)
      
      const response = await fetch(`/api/media?${params}`)
      const data = await response.json()
      setMedia(data.media)
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        setMedia(prev => [result.media, ...prev])
      } catch (error) {
        console.error('Upload error:', error)
        alert(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMedia(prev => prev.filter(m => m.id !== id))
        if (selectedMedia?.id === id) setSelectedMedia(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete media')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('URL copied to clipboard!')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Media Library</h1>
          <p className="text-gray-600">Upload and manage your images and videos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-lg ${
                  filterType === 'ALL'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('IMAGE')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filterType === 'IMAGE'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon size={16} />
                Images
              </button>
              <button
                onClick={() => setFilterType('VIDEO')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  filterType === 'VIDEO'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Video size={16} />
                Videos
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSyncCloudinary}
                disabled={syncing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing...' : 'Sync from Cloudinary'}
              </button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2">
                  <Upload size={16} />
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </div>
              </label>
            </div>
          </div>
          
          {syncStatus && (
            <div className={`mt-4 p-3 rounded-lg ${
              syncStatus.includes('failed') ? 'bg-red-100 text-red-700' : 
              syncStatus.includes('complete') ? 'bg-green-100 text-green-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {syncStatus}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Loading media...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No media uploaded yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first image or video</p>
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleUpload}
                className="hidden"
              />
              <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition inline-flex items-center gap-2">
                <Upload size={16} />
                Upload Files
              </div>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group relative"
                onClick={() => setSelectedMedia(item)}
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {item.resourceType === 'IMAGE' ? (
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    {item.resourceType === 'IMAGE' ? (
                      <ImageIcon size={12} />
                    ) : (
                      <Video size={12} />
                    )}
                    {item.format?.toUpperCase()}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{item.originalName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Media Details</h2>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                {selectedMedia.resourceType === 'IMAGE' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.originalName}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filename
                  </label>
                  <p className="text-sm text-gray-900">{selectedMedia.originalName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedMedia.url}
                      readOnly
                      className="flex-1 text-sm px-3 py-2 border rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => copyUrl(selectedMedia.url)}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <p className="text-sm text-gray-900">{selectedMedia.resourceType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <p className="text-sm text-gray-900">{selectedMedia.format?.toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedMedia.size)}</p>
                  </div>
                  {selectedMedia.width && selectedMedia.height && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dimensions
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedMedia.width} × {selectedMedia.height}
                      </p>
                    </div>
                  )}
                  {selectedMedia.duration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <p className="text-sm text-gray-900">
                        {Math.round(selectedMedia.duration)}s
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => handleDelete(selectedMedia.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
