import { MenuItemDto } from '@tmdjr/service-navigational-list-contracts';
import {
  HierarchicalMenuItem,
  NavigationData,
  OrganizedNavigation,
  Role,
} from '../types/navigation-data.types';

/**
 * Converts a flat array of MenuItemDto objects into a hierarchical structure
 * using the parentId relationships
 */
export function buildMenuHierarchy(
  menuItems: MenuItemDto[]
): HierarchicalMenuItem[] {
  // Create a map for fast lookup
  const itemMap = new Map<string, HierarchicalMenuItem>();
  const rootItems: HierarchicalMenuItem[] = [];

  // First pass: Create all items and add them to the map
  menuItems.forEach((item) => {
    const hierarchicalItem: HierarchicalMenuItem = {
      ...item,
      children: [],
      routeUrl: toSlug(item.menuItemText),
    };
    itemMap.set(item._id, hierarchicalItem);
  });

  // Second pass: Build the hierarchy
  menuItems.forEach((item) => {
    const hierarchicalItem = itemMap.get(item._id);
    if (!hierarchicalItem) return;

    if (item.parentId) {
      // This item has a parent, add it to the parent's children
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(hierarchicalItem);
      } else {
        // Parent not found, treat as root item
        rootItems.push(hierarchicalItem);
      }
    } else {
      // This is a root item
      rootItems.push(hierarchicalItem);
    }
  });

  // Sort root items by sortId
  rootItems.sort((a, b) => a.sortId - b.sortId);

  // Sort children recursively
  const sortChildren = (items: HierarchicalMenuItem[]): void => {
    items.forEach((item) => {
      if (item.children.length > 0) {
        item.children.sort((a, b) => a.sortId - b.sortId);
        sortChildren(item.children);
      }
    });
  };

  sortChildren(rootItems);

  return rootItems;
}

/**
 * Converts the incoming NavigationData into an organized hierarchical structure
 */
export function organizeNavigationData(
  navigationData: NavigationData
): OrganizedNavigation {
  const organizedNav: OrganizedNavigation = {
    domain: navigationData.domain,
    structuralSubtypes: {},
  };

  // Process each structural subtype
  Object.entries(navigationData.structuralSubtypes).forEach(
    ([subtypeKey, subtypeData]) => {
      if (!subtypeData) return;

      const organizedSubtype = {
        states: {} as { [state: string]: HierarchicalMenuItem[] },
      };

      // Process each state within the subtype
      Object.entries(subtypeData.states).forEach(([stateKey, menuItems]) => {
        if (Array.isArray(menuItems)) {
          organizedSubtype.states[stateKey] = buildMenuHierarchy(menuItems);
        }
      });

      organizedNav.structuralSubtypes[
        subtypeKey as keyof typeof organizedNav.structuralSubtypes
      ] = organizedSubtype;
    }
  );

  return organizedNav;
}

/**
 * Converts a string to a URL-friendly slug
 */
function toSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Flattens a hierarchical menu structure back to a flat array
 * Useful for searching or filtering operations
 */
export function flattenMenuHierarchy(
  hierarchicalItems: HierarchicalMenuItem[]
): HierarchicalMenuItem[] {
  const flattened: HierarchicalMenuItem[] = [];

  const flatten = (items: HierarchicalMenuItem[]): void => {
    items.forEach((item) => {
      flattened.push(item);
      if (item.children.length > 0) {
        flatten(item.children);
      }
    });
  };

  flatten(hierarchicalItems);
  return flattened;
}

/**
 * Finds a menu item by its ID in a hierarchical structure
 */
export function findMenuItemById(
  hierarchicalItems: HierarchicalMenuItem[],
  id: string
): HierarchicalMenuItem | undefined {
  for (const item of hierarchicalItems) {
    if (item._id === id) {
      return item;
    }
    if (item.children.length > 0) {
      const found = findMenuItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Filters menu items based on authentication requirements
 */
export function filterMenuItemsByAuth(
  hierarchicalItems: HierarchicalMenuItem[],
  role: Role
): HierarchicalMenuItem[] {
  // Helper to determine if a user with `userRole` can access an item with `itemRole`
  const canAccess = (itemRole: Role | undefined, userRole: Role): boolean => {
    const effectiveItemRole: Role = itemRole ?? 'none';
    switch (userRole) {
      case 'admin':
        // Admin sees everything
        return true;
      case 'publisher':
        // Publisher sees all except items restricted to admin only
        return effectiveItemRole !== 'admin';
      case 'regular':
        // Regular sees only regular and none
        return effectiveItemRole === 'regular' || effectiveItemRole === 'none';
      case 'none':
      default:
        // None sees only none
        return effectiveItemRole === 'none';
    }
  };
  return hierarchicalItems
    .filter((item) => canAccess(item.role as Role | undefined, role))
    .map((item) => ({
      ...item,
      children: filterMenuItemsByAuth(item.children, role),
    }));
}
