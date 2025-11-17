'use client'

import { useState, useEffect } from 'react'
import { X, Image as ImageIcon, Video, Check } from 'lucide-react'

interface Media {
  id: string
  filename: string
  originalName: string
  url: string
  resourceType: 'IMAGE' | 'VIDEO'
  format: string | null
  size: number
  width: number | null
  height: number | null
}

interface MediaSelectorProps {
  type?: 'IMAGE' | 'VIDEO' | 'ALL'
  multiple?: boolean
  onSelect: (selected: Media | Media[]) => void
  onClose: () => void
}

export default function MediaSelector({
  type = 'ALL',
  multiple = false,
  onSelect,
  onClose,
}: MediaSelectorProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMedia()
  }, [type])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (type !== 'ALL') params.set('type', type)

      const response = await fetch(`/api/media?${params}`)
      const data = await response.json()
      setMedia(data.media)
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      if (multiple) {
        newSelected.add(id)
      } else {
        newSelected.clear()
        newSelected.add(id)
      }
    }
    setSelected(newSelected)
  }

  const handleConfirm = () => {
    const selectedMedia = media.filter(m => selected.has(m.id))
    if (multiple) {
      onSelect(selectedMedia)
    } else {
      onSelect(selectedMedia[0])
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Select Media</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No media available. Please upload media first in the Media Library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer relative ${
                    selected.has(item.id) ? 'ring-2 ring-black' : ''
                  }`}
                  onClick={() => toggleSelection(item.id)}
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
                    </div>
                    {selected.has(item.id) && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="bg-black text-white rounded-full p-2">
                          <Check size={24} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{item.originalName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Select {selected.size > 0 && `(${selected.size})`}
          </button>
        </div>
      </div>
    </div>
  )
}
