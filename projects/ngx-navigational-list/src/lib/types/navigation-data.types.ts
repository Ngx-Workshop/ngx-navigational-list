import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';

/**
 * Represents the different states a menu can have
 */
export type MenuState = 'FULL' | 'RELAXED' | 'COMPACT';

/**
 * Represents the different structural subtypes
 */
export type StructuralSubtype = 'HEADER' | 'NAV' | 'FOOTER';

/**
 * Represents the different domains
 */
export type Domain = 'ADMIN' | 'WORKSHOP';

/**
 * Structure for organizing menu items by their state
 */
export interface StateMenuItems {
  [key: string]: MenuItemDto[];
}

/**
 * Structure for organizing menu items by their structural subtype
 */
export type StructuralSubtypeMenuItems = {
  [K in StructuralSubtype]?: {
    states: StateMenuItems;
  };
};

/**
 * Main navigation data structure received from the shell
 */
export interface NavigationData {
  domain: Domain;
  structuralSubtypes: StructuralSubtypeMenuItems;
}

/**
 * Enhanced MenuItemDto with populated children for hierarchical navigation
 */
export interface HierarchicalMenuItem extends Omit<MenuItemDto, 'children'> {
  children: HierarchicalMenuItem[];
  routeUrl?: string;
}

/**
 * Organized navigation structure by domain and structural subtype
 */
export type OrganizedNavigation = {
  domain: Domain;
  structuralSubtypes: {
    [K in StructuralSubtype]?: {
      states: {
        [state: string]: HierarchicalMenuItem[];
      };
    };
  };
};