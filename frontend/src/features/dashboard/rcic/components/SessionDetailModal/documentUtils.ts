/**
 * Handle opening a document in a new tab
 */
export const handleOpenInNewTab = (file: any) => {
  if (!file) return
  
  const fileUrl = file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl
  
  if (fileUrl) {
    if (file.type?.startsWith('image/') || file.type === 'application/pdf') {
      window.open(fileUrl, '_blank')
    } else {
      if (file.type?.startsWith('text/')) {
        alert('Text file content is already displayed in the preview above.')
      } else {
        alert('This file type cannot be opened in a new tab. Please download it to view.')
      }
    }
  } else if (file.content || file.file_content || file.data || file.base64Content) {
    try {
      const content = file.content || file.file_content || file.data || file.base64Content
      const blob = new Blob([content], { 
        type: file.type || 'application/octet-stream' 
      })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      alert('Unable to open file preview. Please download the file to view.')
    }
  } else {
    // Check if this is an intake form file with only metadata
    if (file.id && file.name && file.size && file.type && !file.url && !file.content) {
      alert(`File "${file.name}" appears to be an intake form upload that only saved metadata.\\n\\nThis can happen when:\\n• File upload was interrupted\\n• File storage service was unavailable\\n• File was uploaded but not properly stored\\n\\nPlease ask the client to re-upload this document.`)
    } else {
      alert('File URL not available. This upload likely only saved metadata without a downloadable link.')
    }
  }
}

/**
 * Handle downloading a document
 */
export const handleDownloadDocument = async (file: any) => {
  if (!file) return
  
  try {
    const fileUrl = file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl
    
    // Try to fetch and download the file
    if (fileUrl) {
      try {
        const response = await fetch(fileUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name || file.file_name || 'document'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        return
      } catch (fetchError) {
        // Fallback to direct download
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = file.name || file.file_name || 'document'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }
    }
    
    // If we have file content, create blob for download
    if (file.content || file.file_content || file.data) {
      const content = file.content || file.file_content || file.data
      let blob
      
      // Handle base64 content
      if (typeof content === 'string' && content.includes('base64')) {
        const base64Data = content.split(',')[1] || content
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' })
      } else {
        blob = new Blob([content], { type: file.type || 'application/octet-stream' })
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name || file.file_name || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return
    }
    
    alert('File is not accessible. It may need to be re-uploaded.')
  } catch (error: any) {
    alert(`Download failed: ${error.message || 'Please try again or contact support.'}`)
  }
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Enhanced file object for consistent handling
 */
export const enhanceFileObject = (file: any) => {
  return {
    ...file,
    name: file.name || file.file_name || 'Unknown File',
    content: file.content || file.file_content || file.data || file.base64Content,
    url: file.url || file.file_url || file.download_url || file.file_path || file.uploadedFileUrl,
    type: file.type || file.file_type || file.mime_type || file.contentType || 'application/octet-stream',
    size: file.size || file.file_size || file.fileSize || 0,
    uploadedAt: file.uploadedAt || file.uploaded_at || file.createdAt || file.created_at || new Date().toISOString()
  }
}