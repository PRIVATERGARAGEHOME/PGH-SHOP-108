select
  (select count(*) from public.products) as total_products,
  (select count(*) from public.products where product_type = 'premium') as premium_products,
  (select count(*) from public.products where product_type = 'free') as free_products,
  (select count(*) from public.admin_users) as total_admins;
