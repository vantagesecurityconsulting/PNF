import { useRef, useState } from 'react'
import { Camera, X, ImagePlus } from 'lucide-react'
import { readImagesResized } from '../../utils/image'

/**
 * Reusable photo attach control. Lets the user pick/capture images (data URLs),
 * shows thumbnails, and supports removal. `value` is an array of data URLs.
 */
export function PhotoUploader({ value = [], onChange, max = 6, label = 'Add Photos', compact = false }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const pick = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    setBusy(true)
    const urls = await readImagesResized(files)
    onChange?.([...value, ...urls].slice(0, max))
    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = (i) => onChange?.(value.filter((_, idx) => idx !== i))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-black/10">
            <img src={src} alt={`attachment ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
              aria-label="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-graytext transition-colors hover:border-green hover:text-green ${
              compact ? 'h-20 w-20' : 'h-20 w-24'
            }`}
          >
            {busy ? <ImagePlus size={20} className="animate-pulse" /> : <Camera size={20} />}
            <span className="text-[10px] font-bold">{busy ? 'Adding…' : label}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={pick}
        className="hidden"
      />
    </div>
  )
}

export default PhotoUploader
