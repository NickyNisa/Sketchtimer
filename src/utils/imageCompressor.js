
export function compressImageFile(file, maxDimension = 640, quality = 0.72) {
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
