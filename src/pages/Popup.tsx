import { Clipboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function () {
  return (
    <div className="flex flex-col gap-2 bg-background p-4">
      <Select>
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
}
