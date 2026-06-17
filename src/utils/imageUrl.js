export function toCollageUrl(url) {
  if (!url) return url
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=300&quality=65'
}
