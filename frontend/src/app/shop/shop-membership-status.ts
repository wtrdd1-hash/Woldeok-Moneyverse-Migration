/** A search or price ceiling must not change a member's verified VIP entitlement. */
export function hasVerifiedVipPass(
  catalog: readonly { readonly code: string; readonly user_owned_quantity: number }[],
): boolean {
  const pass = catalog.find(
    (item) => item.code === 'item_vip_lounge_pass' || item.code.includes('vip_lounge'),
  );
  return Boolean(pass && pass.user_owned_quantity > 0);
}
