import { Clipboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function () {
  const [isInYouTube, setIsInYouTube] = useState(false)

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      const tabUrl = tabs[0].url || ''

      setIsInYouTube(
        /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/.test(
          tabUrl,
        ),
      )
    })
  }, [])

  if (isInYouTube)
    return (
      <div className="flex flex-col gap-2 bg-background p-4">
        <Select defaultValue="hd">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Quality" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="hd">HD (1280x720)</SelectItem>
            <SelectItem value="sd">SD (640x480)</SelectItem>
            <SelectItem value="normal-lg">Normal (480x360)</SelectItem>
            <SelectItem value="normal-md">Normal (320x180)</SelectItem>
            <SelectItem value="normal-sm">Normal (120x90)</SelectItem>
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

  return (
    <div className="grid aspect-video w-[200px] place-items-center">
      <p>Invalid YouTube url</p>
    </div>
  )
}
