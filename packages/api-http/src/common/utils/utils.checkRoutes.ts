/**
 * Checks whether a route exists in a list of HTTP routes. Supports ExpressJS-style route parameters, i.e. /users/item/:id.
 * @param route (required) - The route to be checked.
 * @param routes (required) - The array of routes to check in.
 * @returns A boolean, which is the result of the check.
 */
export function checkRoutes(route: string, routes: string[]): boolean {
  const splitRoute = route.split('/');
  for (const i in routes) {
    const item = routes[i],
      splitItem = item.split('/');
    if (item === '*' || route === item) {
      return true;
    }
    if (item.indexOf(':') !== -1 && splitItem.length === splitRoute.length) {
      let valid = true;
      for (const j in splitItem) {
        const innerItem = splitItem[j],
          routeItem = splitRoute[j];
        if (routeItem !== innerItem && innerItem.indexOf(':') === -1) {
          valid = false;
          break;
        }
      }
      if (valid) {
        return true;
      }
    }
  }
  return false;
}
