/**
 * Compone clases condicionales. Evita depender de `clsx` para algo tan simple.
 *
 *   cn('p-4', isActive && 'bg-blue-50', disabled ? 'opacity-50' : null)
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default cn;
