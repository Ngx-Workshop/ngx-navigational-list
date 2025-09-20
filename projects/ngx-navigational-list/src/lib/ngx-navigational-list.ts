import { Injectable } from "@angular/core";
import { MfeRemoteDto } from "@tmdjr/ngx-mfe-orchestrator-contracts";
import { BehaviorSubject, filter, map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NgxNavigationalListService {
  constructor() {}

  userJourneyRemotes = new BehaviorSubject<MfeRemoteDto[] | null>(null);
  userJourneyRemotes$ = this.userJourneyRemotes.asObservable();

  navigationList$ = this.userJourneyRemotes$.pipe(
    filter((remotes): remotes is MfeRemoteDto[] => remotes !== null),
    map((remotes) => remotes.map((remote) => ({
        routeUrl: this.toSlug(remote.name),
        ...remote,
      }))
    )
  );

  private toSlug(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }
}