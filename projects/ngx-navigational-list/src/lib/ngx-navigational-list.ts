import { Injectable } from "@angular/core";
import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import { BehaviorSubject, filter, map, Observable } from "rxjs";
import {
  NavigationData,
  OrganizedNavigation,
  HierarchicalMenuItem,
  StructuralSubtype,
  Domain
} from './types/navigation-data.types';
import {
  organizeNavigationData,
  filterMenuItemsByAuth,
  findMenuItemById,
  flattenMenuHierarchy
} from './utils/navigation-hierarchy.utils';

@Injectable({
  providedIn: "root",
})
export class NgxNavigationalListService {
  constructor() {}

  // Main navigation data subject
  private navigationDataSubject = new BehaviorSubject<NavigationData | null>(null);
  public navigationData$ = this.navigationDataSubject.asObservable();

  // Organized navigation with hierarchy
  public organizedNavigation$: Observable<OrganizedNavigation | null> = this.navigationData$.pipe(
    map(data => data ? organizeNavigationData(data) : null)
  );

  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Sets the navigation data received from the shell
   */
  setNavigationData(navigationData: NavigationData): void {
    this.navigationDataSubject.next(navigationData);
  }

  /**
   * Updates the authentication state
   */
  setAuthenticationState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  /**
   * Gets navigation for a specific structural subtype and state
   */
  getNavigationBySubtypeAndState(
    subtype: StructuralSubtype,
    state: string = 'FULL'
  ): Observable<HierarchicalMenuItem[]> {
    return this.organizedNavigation$.pipe(
      filter((nav): nav is OrganizedNavigation => nav !== null),
      map(nav => {
        const subtypeData = nav.structuralSubtypes[subtype];
        if (!subtypeData || !subtypeData.states[state]) {
          return [];
        }
        return subtypeData.states[state];
      })
    );
  }

  /**
   * Gets filtered navigation based on authentication state
   */
  getFilteredNavigationBySubtypeAndState(
    subtype: StructuralSubtype,
    state: string = 'FULL'
  ): Observable<HierarchicalMenuItem[]> {
    return this.getNavigationBySubtypeAndState(subtype, state).pipe(
      map(items => {
        const isAuthenticated = this.isAuthenticatedSubject.value;
        return filterMenuItemsByAuth(items, isAuthenticated);
      })
    );
  }

  /**
   * Finds a specific menu item by ID across all navigation
   */
  findMenuItemById(id: string): Observable<HierarchicalMenuItem | undefined> {
    return this.organizedNavigation$.pipe(
      filter((nav): nav is OrganizedNavigation => nav !== null),
      map(nav => {
        // Search across all subtypes and states
        for (const subtypeData of Object.values(nav.structuralSubtypes)) {
          if (subtypeData) {
            for (const stateItems of Object.values(subtypeData.states)) {
              const found = findMenuItemById(stateItems, id);
              if (found) {
                return found;
              }
            }
          }
        }
        return undefined;
      })
    );
  }

  /**
   * Gets the current domain
   */
  getCurrentDomain(): Observable<Domain | null> {
    return this.navigationData$.pipe(
      map(data => data?.domain || null)
    );
  }

  /**
   * Gets all available structural subtypes
   */
  getAvailableSubtypes(): Observable<StructuralSubtype[]> {
    return this.organizedNavigation$.pipe(
      filter((nav): nav is OrganizedNavigation => nav !== null),
      map(nav => Object.keys(nav.structuralSubtypes) as StructuralSubtype[])
    );
  }

  /**
   * Gets all available states for a specific subtype
   */
  getAvailableStates(subtype: StructuralSubtype): Observable<string[]> {
    return this.organizedNavigation$.pipe(
      filter((nav): nav is OrganizedNavigation => nav !== null),
      map(nav => {
        const subtypeData = nav.structuralSubtypes[subtype];
        return subtypeData ? Object.keys(subtypeData.states) : [];
      })
    );
  }

  /**
   * Utility method to flatten hierarchical menu items
   */
  flattenMenuItems(items: HierarchicalMenuItem[]): HierarchicalMenuItem[] {
    return flattenMenuHierarchy(items);
  }

  private toSlug(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }
}