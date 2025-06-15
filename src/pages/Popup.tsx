import { Clipboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import browser from 'webextension-polyfill'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const YT_REGEX = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/

const formSchema = z.object({
  quality: z.enum(['maxresdefault', 'sddefault', 'mqdefault', 'default']),
  filename: z.string(),
})

export default function Popup() {
  const [videoId, setVideoId] = useState<string | undefined>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quality: 'default',
      filename: 'thumbnail',
    },
  })

  useEffect(() => {
    browser.tabs.query({ active: true, lastFocusedWindow: true }).then((tabs) => {
      const tabUrl = tabs[0].url || ''

      if (YT_REGEX.test(tabUrl)) setVideoId(YT_REGEX.exec(tabUrl)?.at(5))
    })
  }, [])

  function handleDownload(values: z.infer<typeof formSchema>) {
    const downloadUrl = `https://img.youtube.com/vi/${videoId}/${values.quality}.jpg`
    browser.downloads.download({ url: downloadUrl, filename: `${values.filename}.jpg` })
  }

  if (!videoId)
    return (
      <div className="grid aspect-video w-[200px] place-items-center">
        <p className="text-muted-foreground text-xs">Enter in a valid YouTube video.</p>
      </div>
    )

  return (
    <Form {...form}>
      <form className="flex w-[200px] flex-col gap-2 bg-background p-4" onSubmit={form.handleSubmit(handleDownload)}>
        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          )}
        />

        <FormField
          control={form.control}
          name="filename"
          render={({ field }) => <Input placeholder="filename" {...field} />}
        />

        <div className="flex gap-2">
          <Button variant={'outline'} type="submit" className="grow">
            Download
          </Button>

          <Button variant={'outline'} size="icon">
            <Clipboard />
          </Button>
        </div>
      </form>
    </Form>
  )
}
