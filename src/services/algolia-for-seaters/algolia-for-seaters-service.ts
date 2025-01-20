import { FanGroup, WaitingList } from './algolia-for-seaters-types';
import { PagedResult, SeatersApiContext } from '../../seaters-api';

export class AlgoliaForSeatersService {
  constructor(private apiContext: SeatersApiContext) {}

  getFanGroupById(fanGroupId: string): Promise<FanGroup> {
    return this.apiContext.get('/groups/:fanGroupId/look', { fanGroupId });
  }

  getWaitingListsByFanGroupId(
    fanGroupId: string,
    hitsPerPage: number,
    itemOffset: number = 0
  ): Promise<PagedResult<WaitingList>> {
    return this.apiContext.get(
      `/public/wishlists/${fanGroupId}/wishlists/publicsdk`,
      {},
      { itemOffset, maxPageSize: hitsPerPage }
    );
  }

  getWaitingListById(waitingListId: string): Promise<WaitingList> {
    return this.apiContext.get(`/public/wishlists/${waitingListId}/public`);
  }
}
