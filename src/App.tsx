import 'yet-another-react-lightbox/styles.css'
import './index.css'

import { Toaster } from '@/components/ui/sonner'
import { BookmarksProvider } from '@/providers/BookmarksProvider'
import { ButtonRadiusProvider } from '@/providers/ButtonRadiusProvider'
import { CompactSidebarProvider } from '@/providers/CompactSidebarProvider'
import { ContentPolicyProvider } from '@/providers/ContentPolicyProvider'
import { DeletedEventProvider } from '@/providers/DeletedEventProvider'
import { EntranceMusicProvider } from '@/providers/EntranceMusicProvider'
import { FavoriteRelaysProvider } from '@/providers/FavoriteRelaysProvider'
import { FeedProvider } from '@/providers/FeedProvider'
import { FollowListProvider } from '@/providers/FollowListProvider'
import { FontFamilyProvider } from '@/providers/FontFamilyProvider'
import { FontSizeProvider } from '@/providers/FontSizeProvider'
import { KindFilterProvider } from '@/providers/KindFilterProvider'
import { LayoutModeProvider } from '@/providers/LayoutModeProvider'
import { MediaUploadServiceProvider } from '@/providers/MediaUploadServiceProvider'
import { MuteListProvider } from '@/providers/MuteListProvider'
import { NostrProvider } from '@/providers/NostrProvider'
import { PageThemeProvider } from '@/providers/PageThemeProvider'
import { PinListProvider } from '@/providers/PinListProvider'
import { PrimaryColorProvider } from '@/providers/PrimaryColorProvider'
import { ReplyProvider } from '@/providers/ReplyProvider'
import { ScreenSizeProvider } from '@/providers/ScreenSizeProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { TranslationServiceProvider } from '@/providers/TranslationServiceProvider'
import { TrendingNotesDismissedProvider } from '@/providers/TrendingNotesDismissedProvider'
import { UserPreferencesProvider } from '@/providers/UserPreferencesProvider'
import { UserTrustProvider } from '@/providers/UserTrustProvider'
import { WidgetsProvider } from '@/providers/WidgetsProvider'
import { ZapProvider } from '@/providers/ZapProvider'
import { PageManager } from './PageManager'

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <PageThemeProvider>
        <PrimaryColorProvider>
          <FontSizeProvider>
            <FontFamilyProvider>
              <ButtonRadiusProvider>
                <LayoutModeProvider>
                  <CompactSidebarProvider>
                    <ContentPolicyProvider>
                      <EntranceMusicProvider>
                        <ScreenSizeProvider>
                          <DeletedEventProvider>
                            <NostrProvider>
                              <ZapProvider>
                                <TranslationServiceProvider>
                                  <FavoriteRelaysProvider>
                                    <FollowListProvider>
                                      <MuteListProvider>
                                        <UserTrustProvider>
                                          <BookmarksProvider>
                                            <PinListProvider>
                                              <FeedProvider>
                                                <ReplyProvider>
                                                  <MediaUploadServiceProvider>
                                                    <KindFilterProvider>
                                                      <UserPreferencesProvider>
                                                        <TrendingNotesDismissedProvider>
                                                          <WidgetsProvider>
                                                            <PageManager />
                                                            <Toaster />
                                                          </WidgetsProvider>
                                                        </TrendingNotesDismissedProvider>
                                                      </UserPreferencesProvider>
                                                    </KindFilterProvider>
                                                  </MediaUploadServiceProvider>
                                                </ReplyProvider>
                                              </FeedProvider>
                                            </PinListProvider>
                                          </BookmarksProvider>
                                        </UserTrustProvider>
                                      </MuteListProvider>
                                    </FollowListProvider>
                                  </FavoriteRelaysProvider>
                                </TranslationServiceProvider>
                              </ZapProvider>
                            </NostrProvider>
                          </DeletedEventProvider>
                        </ScreenSizeProvider>
                      </EntranceMusicProvider>
                    </ContentPolicyProvider>
                  </CompactSidebarProvider>
                </LayoutModeProvider>
              </ButtonRadiusProvider>
            </FontFamilyProvider>
          </FontSizeProvider>
        </PrimaryColorProvider>
      </PageThemeProvider>
    </ThemeProvider>
  )
}
