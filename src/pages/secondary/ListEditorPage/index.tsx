import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useLists } from '@/providers/ListsProvider'
import { useSearchProfiles } from '@/hooks/useSearchProfiles'
import { useSecondaryPage } from '@/PageManager'
import { Search, X, UserPlus } from 'lucide-react'
import { forwardRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import UserAvatar from '@/components/UserAvatar'
import Username from '@/components/Username'
import { Card, CardContent } from '@/components/ui/card'

type ListEditorPageProps = {
  index?: number
  listId?: string // If provided, we're editing; otherwise, creating
}

const ListEditorPage = forwardRef<HTMLDivElement, ListEditorPageProps>(
  ({ index, listId }, ref) => {
    const { t } = useTranslation()
    const { pop } = useSecondaryPage()
    const { lists, createList, updateList } = useLists()

    const existingList = listId ? lists.find((l) => l.id === listId) : undefined
    const isEditing = !!listId

    const [title, setTitle] = useState(existingList?.title || '')
    const [description, setDescription] = useState(existingList?.description || '')
    const [image, setImage] = useState(existingList?.image || '')
    const [selectedPubkeys, setSelectedPubkeys] = useState<string[]>(
      existingList?.pubkeys || []
    )
    const [searchQuery, setSearchQuery] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const { profiles, isFetching } = useSearchProfiles(searchQuery, 10)

    useEffect(() => {
      if (existingList) {
        setTitle(existingList.title)
        setDescription(existingList.description || '')
        setImage(existingList.image || '')
        setSelectedPubkeys(existingList.pubkeys)
      }
    }, [existingList])

    const handleAddPubkey = (pubkey: string) => {
      if (!selectedPubkeys.includes(pubkey)) {
        setSelectedPubkeys([...selectedPubkeys, pubkey])
        setSearchQuery('')
      }
    }

    const handleRemovePubkey = (pubkey: string) => {
      setSelectedPubkeys(selectedPubkeys.filter((p) => p !== pubkey))
    }

    const handleSave = async () => {
      if (!title.trim()) {
        toast.error(t('Please enter a title'))
        return
      }

      setIsSaving(true)
      try {
        if (isEditing && listId) {
          const { unwrap } = toast.promise(
            updateList(listId, title, selectedPubkeys, description, image),
            {
              loading: t('Updating list...'),
              success: t('List updated!'),
              error: (err) => t('Failed to update list: {{error}}', { error: err.message })
            }
          )
          await unwrap()
        } else {
          const { unwrap } = toast.promise(createList(title, description, image), {
            loading: t('Creating list...'),
            success: t('List created!'),
            error: (err) => t('Failed to create list: {{error}}', { error: err.message })
          })
          const event = await unwrap()
          // Add members after creation
          if (selectedPubkeys.length > 0) {
            const newListId = event.tags.find((tag) => tag[0] === 'd')?.[1]
            if (newListId) {
              await updateList(newListId, title, selectedPubkeys, description, image)
            }
          }
        }
        pop()
      } catch (error) {
        console.error('Failed to save list:', error)
      } finally {
        setIsSaving(false)
      }
    }

    return (
      <SecondaryPageLayout
        ref={ref}
        index={index}
        title={isEditing ? t('Edit List') : t('Create List')}
      >
        <div className="p-4 space-y-6">
          {/* List Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('List Name')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('Enter list name')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('Description')} ({t('optional')})</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('Enter list description')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">{t('Image URL')} ({t('optional')})</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder={t('https://...')}
              />
            </div>
          </div>

          {/* Member Search */}
          <div className="space-y-4">
            <Label>{t('Add Members')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search users...')}
                className="pl-9"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <Card>
                <CardContent className="p-2">
                  {isFetching && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      {t('Searching...')}
                    </div>
                  )}
                  {!isFetching && profiles.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      {t('No users found')}
                    </div>
                  )}
                  {!isFetching &&
                    profiles.map((profile) => (
                      <div
                        key={profile.pubkey}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => handleAddPubkey(profile.pubkey)}
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar pubkey={profile.pubkey} className="w-10 h-10" />
                          <div>
                            <Username pubkey={profile.pubkey} className="font-medium" />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={selectedPubkeys.includes(profile.pubkey)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selected Members */}
          {selectedPubkeys.length > 0 && (
            <div className="space-y-4">
              <Label>
                {t('Members')} ({selectedPubkeys.length})
              </Label>
              <Card>
                <CardContent className="p-2">
                  {selectedPubkeys.map((pubkey) => (
                    <div
                      key={pubkey}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar pubkey={pubkey} className="w-10 h-10" />
                        <div>
                          <Username pubkey={pubkey} className="font-medium" />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePubkey(pubkey)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? t('Saving...') : isEditing ? t('Update List') : t('Create List')}
            </Button>
            <Button variant="outline" onClick={() => pop()} disabled={isSaving}>
              {t('Cancel')}
            </Button>
          </div>
        </div>
      </SecondaryPageLayout>
    )
  }
)
ListEditorPage.displayName = 'ListEditorPage'
export default ListEditorPage
