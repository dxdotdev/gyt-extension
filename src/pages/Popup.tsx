import { Clipboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const YT_REGEX = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/

export default function () {
  const [isInYouTube, setIsInYouTube] = useState(false)
  const [videoId, setVideoId] = useState('')
  const [imageQuality, setImageQuality] = useState('mqdefault')

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      const tabUrl = tabs[0].url || ''
      setIsInYouTube(YT_REGEX.test(tabUrl))
      setVideoId(YT_REGEX.exec(tabUrl)?.at(5) || '')
    })
  }, [])

  const downloadUrl = `https://img.youtube.com/vi/${videoId}/${imageQuality}.jpg`
  browser.downloads.download({ url: downloadUrl, filename: 'Teste' })

  if (!isInYouTube)
    return (
      <div className="grid aspect-video w-[200px] place-items-center">
        <p className="text-muted-foreground text-xs">Enter in a valid YouTube video.</p>
      </div>
    )

  return (
    <div className="flex w-[200px] flex-col gap-2 bg-background p-4">
      <Select defaultValue="mqdefault" defaultOpen>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Quality" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="maxresdefault">HD (1280x720)</SelectItem>
          <SelectItem value="sddefault">SD (640x480)</SelectItem>
          <SelectItem value="mqdefault">Normal (320x180)</SelectItem>
          <SelectItem value="default">Normal (120x90)</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button variant={'outline'}>Download</Button>

        <Button variant={'outline'} size="icon">
          <Clipboard />
        </Button>
      </div>
    </div>
  )
}
