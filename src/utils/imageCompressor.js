/**
 * ย่อขนาดและบีบอัดรูปภาพที่ผู้ใช้อัปโหลดให้เป็น Base64 Data URL ขนาดเล็ก
 * เพื่อให้สามารถบันทึกลง MockAPI.io (JSON) ได้หลายรูปใน 1 Preset
 */
export function compressImageFile(file, maxDimension = 480, quality = 0.65) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น (.jpg, .png, .webp)'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'))
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('ไฟล์รูปภาพไม่ถูกต้อง'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * แปลงค่า imageUrl ของ Preset ให้เป็น Array ของ URL รูปภาพเสมอ
 * รองรับทั้ง Preset เก่าที่มี 1 รูป และ Preset ใหม่ที่มีหลายรูป (JSON string)
 */
export function parsePresetImages(preset) {
  if (!preset) return []
  if (Array.isArray(preset.images) && preset.images.length > 0) {
    return preset.images.filter(Boolean)
  }
  const raw = preset.imageUrl
  if (!raw || typeof raw !== 'string') return []

  const trimmed = raw.trim()
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((u) => typeof u === 'string' && u.trim().length > 0)
      }
    } catch {
      // Fallback to single string
    }
  }
  return [trimmed]
}

/**
 * แปลง Array รูปภาพเป็น String เพื่อเก็บในฟิลด์ imageUrl บน MockAPI.io
 */
export function serializePresetImages(imageList) {
  const clean = (imageList || []).filter((u) => typeof u === 'string' && u.trim().length > 0)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  return JSON.stringify(clean)
}

/**
 * แตก Preset ที่มีหลายรูปให้เป็นรายการสไลด์สำหรับโหมด Present (PracticePage)
 */
export function expandPresetsToSlides(presetList) {
  const slides = []
  for (const preset of presetList || []) {
    const imgs = parsePresetImages(preset)
    imgs.forEach((imgUrl, idx) => {
      slides.push({
        id: `${preset.id}-${idx + 1}`,
        title: imgs.length > 1 ? `${preset.title} (รูปที่ ${idx + 1}/${imgs.length})` : preset.title,
        category: preset.category,
        duration: Number(preset.duration) || 60,
        notes: preset.notes || '',
        imageUrl: imgUrl,
      })
    })
  }
  return slides
}
