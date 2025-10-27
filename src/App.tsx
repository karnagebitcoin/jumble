import 'yet-another-react-lightbox/styles.css'
import './index.css'

import { Toaster } from '@/components/ui/sonner'
import { AIProvider } from '@/providers/AIProvider'
import { BookmarksProvider } from '@/providers/BookmarksProvider'
import { ButtonRadiusProvider } from '@/providers/ButtonRadiusProvider'
import { CompactSidebarProvider } from '@/providers/CompactSidebarProvider'
import { ContentPolicyProvider } from '@/providers/ContentPolicyProvider'
import { DeckViewProvider } from '@/providers/DeckViewProvider'
import { CustomFeedsProvider } from '@/providers/CustomFeedsProvider'
import { DeletedEventProvider } from '@/providers/DeletedEventProvider'
import { DistractionFreeModeProvider } from '@/providers/DistractionFreeModeProvider'
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
import { ReadsVisibilityProvider } from '@/providers/ReadsVisibilityProvider'
import { ReplyProvider } from '@/providers/ReplyProvider'
import { ScreenSizeProvider } from '@/providers/ScreenSizeProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { TranslationServiceProvider } from '@/providers/TranslationServiceProvider'
import { TrendingNotesDismissedProvider } from '@/providers/TrendingNotesDismissedProvider'
import { UserPreferencesProvider } from '@/providers/UserPreferencesProvider'
import { UserTrustProvider } from '@/providers/UserTrustProvider'
import { WidgetsProvider } from '@/providers/WidgetsProvider'
import { WidgetSidebarDismissedProvider } from '@/providers/WidgetSidebarDismissedProvider'
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
                  <DeckViewProvider>
                    <CompactSidebarProvider>
                      <DistractionFreeModeProvider>
                        <ContentPolicyProvider>
                          <ReadsVisibilityProvider>
                            <ScreenSizeProvider>
                              <DeletedEventProvider>
                            <NostrProvider>
                              <ZapProvider>
                                <TranslationServiceProvider>
                                  <AIProvider>
                                      <FavoriteRelaysProvider>
                                        <FollowListProvider>
                                          <MuteListProvider>
                                            <UserTrustProvider>
                                              <BookmarksProvider>
                                                <PinListProvider>
                                                  <CustomFeedsProvider>
                                                    <FeedProvider>
                                                      <ReplyProvider>
                                                        <MediaUploadServiceProvider>
                                                          <KindFilterProvider>
                                                            <UserPreferencesProvider>
                                                              <TrendingNotesDismissedProvider>
                                                                <WidgetsProvider>
                                                                  <WidgetSidebarDismissedProvider>
                                                                    <PageManager />
                                                                    <Toaster />
                                                                  </WidgetSidebarDismissedProvider>
                                                                </WidgetsProvider>
                                                              </TrendingNotesDismissedProvider>
                                                            </UserPreferencesProvider>
                                                          </KindFilterProvider>
                                                        </MediaUploadServiceProvider>
                                                      </ReplyProvider>
                                                    </FeedProvider>
                                                  </CustomFeedsProvider>
                                                </PinListProvider>
                                              </BookmarksProvider>
                                            </UserTrustProvider>
                                          </MuteListProvider>
                                        </FollowListProvider>
                                      </FavoriteRelaysProvider>
                                    </AIProvider>
                                  </TranslationServiceProvider>
                              </ZapProvider>
                            </NostrProvider>
                              </DeletedEventProvider>
                            </ScreenSizeProvider>
                          </ReadsVisibilityProvider>
                        </ContentPolicyProvider>
                      </DistractionFreeModeProvider>
                    </CompactSidebarProvider>
                  </DeckViewProvider>
                </LayoutModeProvider>
              </ButtonRadiusProvider>
            </FontFamilyProvider>
          </FontSizeProvider>
        </PrimaryColorProvider>
      </PageThemeProvider>
    </ThemeProvider>
  )
}
