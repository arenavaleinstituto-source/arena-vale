-- ARENA VALE — garante o valor 'proprietario' no enum user_role.
-- Em produção ele já existe (criado fora das migrações); num banco novo, não.
-- Fica num arquivo separado porque o Postgres não permite usar um valor de
-- enum na mesma transação em que ele foi criado (a 0009 usa o valor).
alter type public.user_role add value if not exists 'proprietario';
