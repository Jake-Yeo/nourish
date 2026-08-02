export function compressMealPhoto(photoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const sourceImage = new Image()
    const sourceUrl = URL.createObjectURL(photoFile)
    sourceImage.onload = () => {
      const maximumDimension = 1600
      const scaleFactor = Math.min(1, maximumDimension / Math.max(sourceImage.width, sourceImage.height))
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = Math.round(sourceImage.width * scaleFactor)
      outputCanvas.height = Math.round(sourceImage.height * scaleFactor)
      outputCanvas.getContext('2d')?.drawImage(sourceImage, 0, 0, outputCanvas.width, outputCanvas.height)
      URL.revokeObjectURL(sourceUrl)
      resolve(outputCanvas.toDataURL('image/jpeg', 0.78))
    }
    sourceImage.onerror = () => {
      URL.revokeObjectURL(sourceUrl)
      reject(new Error('Could not read that photo.'))
    }
    sourceImage.src = sourceUrl
  })
}
