import { RequestDriver } from '../../api';
import { PagedResult, PagingOptions } from '../../shared-types';
import { SeatersApi, SeatersApiContext } from '../../seaters-api';
import { AlgoliaForSeatersService, TypedSearchResult, GeoLoc } from '../algolia-for-seaters';

import { AppService } from '../app-service';
import { pub } from './public-types';
import { fan } from '../fan-service/fan-types';
type ACCESS_MODE = 'PUBLIC' | 'PRIVATE' | 'CODE_PROTECTED';
interface FanGroupLook {
  accessMode: ACCESS_MODE;

  profileImageUrl: string;
  coverImageUrl: string;
  backgroundImageUrl: string;
  rankAndLikelihoodHidden: boolean;
  showLogo: boolean;
  color: string;

  // Translated
  translatedWelcomeText: string;
  translatedName: string;
  translatedExperienceName: string;
  translatedDescription: string;

  // Not translated (translation map)
  welcomeText: any;
  description: any;
  name: any;
}
export class PublicService {
  private algoliaForSeatersService: AlgoliaForSeatersService;

  constructor(apiContext: SeatersApiContext, requestDriver: RequestDriver) {
    this.algoliaForSeatersService = new AlgoliaForSeatersService(apiContext, requestDriver);
  }

  getFanGroup(fanGroupId: string): Promise<pub.FanGroup> {
    return this.algoliaForSeatersService.getFanGroupById(fanGroupId).then(fg => ({
      ...fg,
      actionStatus: this.getFanGroupActionStatus(fg)
    }));
  }

  getWaitingList(waitingListId: string): Promise<pub.WaitingList> {
    return this.algoliaForSeatersService
      .getWaitingListById(waitingListId)
      .then(wl => ({ ...wl, actionStatus: this.getWaitingListActionStatus(wl) }));
  }

  getWaitingListsInFanGroup(
    fanGroupId: string,
    pagingOptions: PagingOptions,
    geoLoc?: GeoLoc,
    keywords?: string[],
    dateTimeStamp?: string
  ): Promise<PagedResult<pub.WaitingList>> {
    return this.algoliaForSeatersService
      .getWaitingListsByFanGroupId(
        fanGroupId,
        pagingOptions.maxPageSize,
        pagingOptions.page,
        geoLoc,
        keywords,
        dateTimeStamp
      )
      .then(result => this.convertAlgoliaResultSet(result))
      .then(result => {
        result.items = result.items.map(wl => ({ ...wl, actionStatus: this.getWaitingListActionStatus(wl) }));
        return result;
      });
  }

  private defaultPage(page: PagingOptions): PagingOptions {
    if (typeof (page as any) === 'object') {
      return page;
    } else {
      return {
        maxPageSize: 10,
        page: 0
      };
    }
  }

  private convertAlgoliaResultSet<T>(searchResult: TypedSearchResult<T>): PagedResult<T> {
    return {
      items: searchResult.hits as T[],
      itemOffset: searchResult.page * searchResult.hitsPerPage,
      page: searchResult.page,
      maxPageSize: searchResult.hitsPerPage,
      totalSize: searchResult.nbHits
    };
  }

  private getFanGroupActionStatus(
    fanGroup: pub.FanGroup | pub.FanGroupLook | fan.FanGroup | fan.FanGroupLook
  ): fan.FAN_GROUP_ACTION_STATUS {
    if (fanGroup.accessMode === 'CODE_PROTECTED' || fanGroup.accessMode === 'PRIVATE') {
      return fan.FAN_GROUP_ACTION_STATUS.CAN_UNLOCK;
    }

    return fan.FAN_GROUP_ACTION_STATUS.CAN_JOIN;
  }

  /**
   *
   * The action status for public fan groups is limited since we don't have:
   * - position
   * - seat
   * - request
   * - ...
   * since the user is not logged in
   */
  private getWaitingListActionStatus(waitingList: pub.WaitingList): fan.WAITING_LIST_ACTION_STATUS {
    // Coming soon
    if (
      waitingList.waitingListStatus === 'PUBLISHED' ||
      waitingList.waitingListStatus === 'SETUP' ||
      waitingList.waitingListStatus === 'DRAFT'
    ) {
      return fan.WAITING_LIST_ACTION_STATUS.SOON;
    }

    // Closed
    if (waitingList.waitingListStatus === 'CLOSED') {
      return undefined;
    }

    // Code protected
    if (waitingList.accessMode === 'CODE_PROTECTED') {
      return fan.WAITING_LIST_ACTION_STATUS.UNLOCK;
    }

    // Public
    if (waitingList.accessMode === 'PUBLIC') {
      return fan.WAITING_LIST_ACTION_STATUS.BOOK;
    }

    // Anything else is not supported since the user is not logged in
    return undefined;
  }
}
