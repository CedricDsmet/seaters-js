import { FanGroup, WaitingList } from './algolia-for-seaters-types';
import { SeatersApiContext } from '../../seaters-api';

export class AlgoliaForSeatersService {
  constructor(private apiContext: SeatersApiContext) {}

  getFanGroupById(fanGroupId: string): Promise<FanGroup> {
    return this.apiContext.get('/groups/:fanGroupId/look', { fanGroupId });
  }

  getWaitingListsByFanGroupId(fanGroupId: string, hitsPerPage: number, page: number): Promise<WaitingList> {
    return this.apiContext.get(`/groups/${fanGroupId}/wishlists/publicsdk`, {}, { page, maxPageSize: hitsPerPage });
  }

  getWaitingListById(waitingListId: string): Promise<WaitingList> {
    return this.apiContext.get(`/public/wishlists/${waitingListId}/public`);
  }
}
