import { TRelaySet } from '@/types'
import { ChevronDown, FolderClosed } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PinButton from '../PinButton'
import RelayIcon from '../RelayIcon'

export default function RelaySetCard({
  relaySet,
  select,
  onSelectChange
}: {
  relaySet: TRelaySet
  select: boolean
  onSelectChange: (select: boolean) => void
}) {
  const { t } = useTranslation()
  const [expand, setExpand] = useState(false)

  return (
    <div
      className={`w-full border rounded-lg py-1 px-3 clickable group ${select ? 'border-primary bg-primary/5' : ''}`}
      onClick={() => onSelectChange(!select)}
    >
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 items-center cursor-pointer">
          <div className="flex justify-center items-center w-6 h-6 shrink-0">
            <FolderClosed className="size-4" />
          </div>
          <div className="h-8 font-semibold flex items-center select-none">{relaySet.name}</div>
        </div>
        <div className="flex gap-1 items-center">
          <PinButton
            column={{
              type: 'relays',
              props: { activeRelaySetId: relaySet.id }
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <RelayUrlsExpandToggle expand={expand} onExpandChange={setExpand}>
            {t('n relays', { n: relaySet.relayUrls.length })}
          </RelayUrlsExpandToggle>
        </div>
      </div>
      {expand && <RelayUrls urls={relaySet.relayUrls} />}
    </div>
  )
}

function RelayUrlsExpandToggle({
  children,
  expand,
  onExpandChange
}: {
  children: React.ReactNode
  expand: boolean
  onExpandChange: (expand: boolean) => void
}) {
  return (
    <div
      className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground"
      onClick={(e) => {
        e.stopPropagation()
        onExpandChange(!expand)
      }}
    >
      <div className="select-none">{children}</div>
      <ChevronDown
        size={16}
        className={`transition-transform duration-200 ${expand ? 'rotate-180' : ''}`}
      />
    </div>
  )
}

function RelayUrls({ urls }: { urls: string[] }) {
  if (!urls) return null

  const validUrls = urls.filter((url) => url && url.trim())

  return (
    <div className="pl-1 space-y-1">
      {validUrls.map((url) => (
        <div key={url} className="flex items-center gap-3">
          <RelayIcon url={url} className="w-4 h-4" iconSize={10} />
          <div className="text-muted-foreground text-sm truncate">{url}</div>
        </div>
      ))}
    </div>
  )
}
