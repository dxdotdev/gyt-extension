import { Download, Check, Clipboard, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import useFormPersist from 'react-hook-form-persist'
import { sanitize } from 'sanitize-filename-ts'
import browser from 'webextension-polyfill'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const YT_REGEX = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/

type VideoData = {
  title: string
}

type Status = 'default' | 'loading' | 'success' | 'error'

type Quality = 'maxresdefault' | 'sddefault' | 'mqdefault'

const formSchema = z.object({
  quality: z.enum(['maxresdefault', 'sddefault', 'mqdefault']),
  filename: z.string(),
})

export default function Popup() {
  const [videoId, setVideoId] = useState<string | undefined>()
  const [videoData, setVideoData] = useState<VideoData>()

  const [clipboardStatus, setClipboardStatus] = useState<Status>('default')
  const [downloadStatus, setDownloadStatus] = useState<Status>('default')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quality: 'maxresdefault',
      filename: '$title',
    },
  })

  useFormPersist('gyt', {
    watch: form.watch,
    setValue: form.setValue,
    storage: window.localStorage,
  })

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      const tab = tabs[0]
      const tabUrl = tab.url || ''

      if (YT_REGEX.test(tabUrl)) setVideoId(YT_REGEX.exec(tabUrl)?.at(5))

      if (tab.id) browser.tabs.sendMessage(tab.id, '').then((data) => setVideoData(data))
    })
  }, [])

  function handleDownload(values: z.infer<typeof formSchema>) {
    setDownloadStatus('loading')

    if (!videoData) throw new Error('Error passing video data.')
    const filename = sanitize(values.filename.replaceAll('$title', videoData?.title))
    const downloadUrl = `https://img.youtube.com/vi/${videoId}/${values.quality}.jpg`

    browser.downloads
      .download({ url: downloadUrl, filename: `${filename}.jpg` })
      .then(() => {
        setDownloadStatus('success')
      })
      .catch(() => {
        setDownloadStatus('error')
      })
      .finally(() => [
        setTimeout(() => {
          setDownloadStatus('default')
        }, 3000),
      ])
  }

  function handleWriteClipboard() {
    setClipboardStatus('loading')

    const { quality } = form.getValues()
    const downloadUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`

    navigator.clipboard
      .writeText(downloadUrl)
      .then(() => {
        setClipboardStatus('success')
      })
      .catch(() => {
        setClipboardStatus('error')
      })
      .finally(() => {
        setTimeout(() => {
          setClipboardStatus('default')
        }, 3000)
      })
  }

  if (!videoId)
    return (
      <div className="grid aspect-video w-[240px] place-items-center">
        <p className="text-muted-foreground text-xs">Enter in a valid YouTube video.</p>
      </div>
    )

  return (
    <Form {...form}>
      <form className="flex w-[250px] flex-col gap-2 bg-background p-4" onSubmit={form.handleSubmit(handleDownload)}>
        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              className="w-full"
              onValueChange={(value: Quality) => form.setValue('quality', value)}
              defaultValue={field.value}
            >
              <ToggleGroupItem value="maxresdefault">HD</ToggleGroupItem>
              <ToggleGroupItem value="sddefault">SD</ToggleGroupItem>
              <ToggleGroupItem value="mqdefault">180p</ToggleGroupItem>
            </ToggleGroup>
          )}
        />

        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => <Input placeholder="filename" {...field} />}
        />

        <div className="flex gap-2">
          <Button variant="outline" type="submit" className="grow" disabled={downloadStatus !== 'default'}>
            {downloadStatus === 'default' && <Download />}
            {downloadStatus === 'loading' && <Loader2 className="animate-spin" />}
            {downloadStatus === 'success' && <Check />}
            {downloadStatus === 'error' && <X />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            type="button"
            disabled={clipboardStatus !== 'default'}
            onClick={handleWriteClipboard}
          >
            {clipboardStatus === 'default' && <Clipboard />}
            {clipboardStatus === 'loading' && <Loader2 className="animate-spin" />}
            {clipboardStatus === 'success' && <Check />}
            {clipboardStatus === 'error' && <X />}
          </Button>
        </div>
      </form>
    </Form>
  )
}
