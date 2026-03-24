export function triggerFileDownload(data: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([data]))
  link.download = filename
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(link.href)
  document.body.removeChild(link)
}

export function triggerFileDownloadFromUrl(url?: string, filename?: string) {
  fetch(url ?? '')
    .then(response => response.blob())
    .then((blob) => {
      triggerFileDownload(blob, filename ?? 'unknown')
    })
}
