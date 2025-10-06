# NgxNavigationalList

This library provides a service for managing hierarchical navigation data in micro frontend applications using Angular 20.

## Installation

```bash
npm install @tmdjr/ngx-navigational-list
```

## Usage

### Basic Setup

```typescript
import { Component, OnInit } from "@angular/core";
import { NgxNavigationalListService, NavigationData, HierarchicalMenuItem } from "@tmdjr/ngx-navigational-list";
import { Observable } from "rxjs";

@Component({
  selector: "app-navigation",
  templateUrl: "./navigation.component.html",
})
export class NavigationComponent implements OnInit {
  headerNavigation$: Observable<HierarchicalMenuItem[]>;

  constructor(private navService: NgxNavigationalListService) {
    this.headerNavigation$ = this.navService.getFilteredNavigationBySubtypeAndState("HEADER", "FULL");
  }

  ngOnInit() {
    // Set navigation data received from the shell
    const navigationData: NavigationData = {
      domain: "ADMIN",
      structuralSubtypes: {
        HEADER: {
          states: {
            FULL: [
              {
                _id: "68d097bb26641456d521c398",
                menuItemText: "Dashboard",
                routePath: "/dashboard",
                sortId: 0,
                authRequired: false,
                domain: "ADMIN",
                structuralSubtype: "HEADER",
                state: "FULL",
                version: 1,
                description: "Dashboard page",
                lastUpdated: "2025-09-22T01:29:31.104Z",
                archived: false,
                __v: 0,
              },
              {
                _id: "68d03a5b26641456d521c2db",
                menuItemText: "Mission Controls",
                routePath: "/mission-controls",
                sortId: 3,
                authRequired: false,
                domain: "ADMIN",
                structuralSubtype: "HEADER",
                state: "FULL",
                version: 3,
                description: "Mission control center",
                lastUpdated: "2025-09-22T01:29:31.104Z",
                archived: false,
                __v: 0,
              },
              {
                _id: "68d0a16926641456d521c431",
                menuItemText: "Broadcast",
                routePath: "/broadcast",
                sortId: 0,
                authRequired: false,
                parentId: "68d03a5b26641456d521c2db",
                domain: "ADMIN",
                structuralSubtype: "HEADER",
                state: "FULL",
                version: 1,
                description: "Broadcast management",
                lastUpdated: "2025-09-22T01:29:31.104Z",
                archived: false,
                __v: 0,
              },
            ],
          },
        },
      },
    };

    this.navService.setNavigationData(navigationData);
    this.navService.setAuthenticationState(true);
  }
}
```

### Template Example

```html
<!-- navigation.component.html -->
<nav class="navigation">
  <ul class="nav-list">
    <li *ngFor="let menuItem of headerNavigation$ | async; trackBy: trackByMenuItemId" class="nav-item" [class.has-children]="menuItem.children.length > 0">
      <a [routerLink]="menuItem.routePath" class="nav-link" [title]="menuItem.tooltipText"> {{ menuItem.menuItemText }} </a>

      <!-- Render child items recursively -->
      <ul *ngIf="menuItem.children.length > 0" class="sub-nav-list">
        <li *ngFor="let childItem of menuItem.children; trackBy: trackByMenuItemId" class="sub-nav-item">
          <a [routerLink]="childItem.routePath" class="sub-nav-link" [title]="childItem.tooltipText"> {{ childItem.menuItemText }} </a>

          <!-- Continue nesting for deeper levels if needed -->
          <ul *ngIf="childItem.children.length > 0" class="sub-sub-nav-list">
            <li *ngFor="let grandChildItem of childItem.children; trackBy: trackByMenuItemId" class="sub-sub-nav-item">
              <a [routerLink]="grandChildItem.routePath" class="sub-sub-nav-link" [title]="grandChildItem.tooltipText"> {{ grandChildItem.menuItemText }} </a>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

### Component Methods

```typescript
export class NavigationComponent implements OnInit {
  // ... other code

  trackByMenuItemId(index: number, item: HierarchicalMenuItem): string {
    return item._id;
  }

  // Get specific navigation for different states
  getCompactNavigation() {
    return this.navService.getFilteredNavigationBySubtypeAndState("HEADER", "COMPACT");
  }

  // Find a specific menu item
  findMenuItem(id: string) {
    return this.navService.findMenuItemById(id);
  }

  // Get current domain
  getCurrentDomain() {
    return this.navService.getCurrentDomain();
  }
}
```

## API Reference

### Types

- **`NavigationData`**: The main data structure received from the shell
- **`HierarchicalMenuItem`**: Menu item with populated children array
- **`OrganizedNavigation`**: Processed navigation with hierarchy
- **`StructuralSubtype`**: 'HEADER' | 'NAV' | 'FOOTER'
- **`Domain`**: 'ADMIN' | 'WORKSHOP'
- **`MenuState`**: 'FULL' | 'RELAXED' | 'COMPACT'

### Service Methods

#### Core Methods

- `setNavigationData(data: NavigationData)`: Set the navigation data
- `setAuthenticationState(isAuthenticated: boolean)`: Update auth state

#### Navigation Retrieval

- `getNavigationBySubtypeAndState(subtype, state)`: Get raw navigation
- `getFilteredNavigationBySubtypeAndState(subtype, state)`: Get filtered by auth
- `findMenuItemById(id)`: Find specific menu item
- `getCurrentDomain()`: Get current domain
- `getAvailableSubtypes()`: Get available structural subtypes
- `getAvailableStates(subtype)`: Get available states for subtype

#### Utility Methods

- `flattenMenuItems(items)`: Flatten hierarchical structure

## Features

- ✅ **Hierarchical Structure**: Automatically builds parent-child relationships using `parentId`
- ✅ **Authentication Filtering**: Filters menu items based on `authRequired` and user auth state
- ✅ **Sorting**: Automatically sorts items by `sortId` at all levels
- ✅ **Multiple States**: Supports FULL, RELAXED, COMPACT menu states
- ✅ **Multiple Domains**: Supports ADMIN and WORKSHOP domains
- ✅ **TypeScript**: Full TypeScript support with comprehensive types
- ✅ **RxJS Observables**: Reactive data flow for real-time updates
- ✅ **Utility Functions**: Helper functions for searching, filtering, and manipulation

## Data Structure

The service expects navigation data in this format:

```json
{
  "domain": "ADMIN",
  "structuralSubtypes": {
    "HEADER": {
      "states": {
        "FULL": [
          {
            "_id": "unique-id",
            "menuItemText": "Menu Item",
            "routePath": "/path",
            "sortId": 0,
            "authRequired": false,
            "parentId": "parent-id-optional",
            "domain": "ADMIN",
            "structuralSubtype": "HEADER",
            "state": "FULL",
            "version": 1,
            "description": "Description",
            "lastUpdated": "2025-09-22T01:29:31.104Z",
            "archived": false,
            "__v": 0
          }
        ]
      }
    }
  }
}
```

The service automatically converts this flat structure into a hierarchical menu tree based on the `parentId` relationships.
