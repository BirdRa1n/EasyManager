

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."is_team_admin"("t_uuid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $_$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE team_id = $1
      AND role = 'admin'
      AND user_id = auth.uid()
  );
$_$;


ALTER FUNCTION "public"."is_team_admin"("t_uuid" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_identifiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "type" "text" NOT NULL,
    "code" "text" NOT NULL,
    CONSTRAINT "product_identifiers_type_check" CHECK (("type" = ANY (ARRAY['EAN'::"text", 'SKU'::"text", 'INTERNAL'::"text", 'REF'::"text"])))
);


ALTER TABLE "public"."product_identifiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "sku" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "category_id" "uuid",
    "image" "text"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_client" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "email" "text",
    "team_id" "uuid" NOT NULL,
    "service_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."service_client" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "team_id" "uuid" NOT NULL
);


ALTER TABLE "public"."service_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "store_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "type_id" "uuid" NOT NULL,
    "price" numeric,
    "duration" "text",
    "custom_attributes" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'pending'::"text",
    "type" "text",
    CONSTRAINT "services_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_address" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "address" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "country" "text" NOT NULL
);


ALTER TABLE "public"."store_address" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "value" "text" NOT NULL
);


ALTER TABLE "public"."store_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "store_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "price" numeric DEFAULT '0'::numeric,
    "stock" numeric
);


ALTER TABLE "public"."store_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "supplier_id" "uuid" NOT NULL
);


ALTER TABLE "public"."store_suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supplier_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supplier_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL
);


ALTER TABLE "public"."supplier_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "role" "text" NOT NULL,
    "permissions" "jsonb",
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "team_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'manager'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "document" "text",
    "location" "text",
    "logo" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_team_ids" AS
 SELECT "team_id"
   FROM "public"."team_members"
  WHERE ("user_id" = "auth"."uid"());


ALTER VIEW "public"."user_team_ids" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_team_id_name_key" UNIQUE ("team_id", "name");



ALTER TABLE ONLY "public"."product_identifiers"
    ADD CONSTRAINT "product_identifiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_identifiers"
    ADD CONSTRAINT "product_identifiers_product_id_code_key" UNIQUE ("product_id", "code");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_team_id_sku_key" UNIQUE ("team_id", "sku");



ALTER TABLE ONLY "public"."service_client"
    ADD CONSTRAINT "service_client_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_types"
    ADD CONSTRAINT "service_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_suppliers"
    ADD CONSTRAINT "store_suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_suppliers"
    ADD CONSTRAINT "store_suppliers_store_id_supplier_id_key" UNIQUE ("store_id", "supplier_id");



ALTER TABLE ONLY "public"."store_address"
    ADD CONSTRAINT "stores_address_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_contacts"
    ADD CONSTRAINT "stores_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_products"
    ADD CONSTRAINT "supplier_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplier_products"
    ADD CONSTRAINT "supplier_products_supplier_id_product_id_key" UNIQUE ("supplier_id", "product_id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_address"
    ADD CONSTRAINT "fk_store" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_contacts"
    ADD CONSTRAINT "fk_store" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_identifiers"
    ADD CONSTRAINT "product_identifiers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_client"
    ADD CONSTRAINT "service_client_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_client"
    ADD CONSTRAINT "service_client_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_types"
    ADD CONSTRAINT "service_types_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "public"."service_types"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_address"
    ADD CONSTRAINT "store_address_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_address"
    ADD CONSTRAINT "store_address_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_suppliers"
    ADD CONSTRAINT "store_suppliers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_suppliers"
    ADD CONSTRAINT "store_suppliers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_contacts"
    ADD CONSTRAINT "stores_contacts_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_contacts"
    ADD CONSTRAINT "stores_contacts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_products"
    ADD CONSTRAINT "supplier_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplier_products"
    ADD CONSTRAINT "supplier_products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Admins podem adicionar membros ao seu time" ON "public"."team_members" FOR INSERT WITH CHECK ("public"."is_team_admin"("team_id"));



CREATE POLICY "Admins podem deletar seu time" ON "public"."teams" FOR DELETE USING ("public"."is_team_admin"("id"));



CREATE POLICY "Admins podem editar membros do seu time" ON "public"."team_members" FOR UPDATE USING ("public"."is_team_admin"("team_id"));



CREATE POLICY "Admins podem editar seu time" ON "public"."teams" FOR UPDATE USING ("public"."is_team_admin"("id"));



CREATE POLICY "Admins podem remover membros do seu time" ON "public"."team_members" FOR DELETE USING ("public"."is_team_admin"("team_id"));



CREATE POLICY "Admins podem ver membros do seu time" ON "public"."team_members" FOR SELECT USING ("public"."is_team_admin"("team_id"));



CREATE POLICY "Admins podem ver times que participam" ON "public"."teams" FOR SELECT USING ("public"."is_team_admin"("id"));



CREATE POLICY "Criador do time pode se adicionar como admin" ON "public"."team_members" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ("team_id" IN ( SELECT "teams"."id"
   FROM "public"."teams"
  WHERE ("teams"."created_by" = "auth"."uid"())))));



CREATE POLICY "Criador pode ver seu próprio time" ON "public"."teams" FOR SELECT USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Usuário autenticado pode criar seu próprio time" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."products";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."store_contacts";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."is_team_admin"("t_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_team_admin"("t_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_team_admin"("t_uuid" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."product_identifiers" TO "anon";
GRANT ALL ON TABLE "public"."product_identifiers" TO "authenticated";
GRANT ALL ON TABLE "public"."product_identifiers" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."service_client" TO "anon";
GRANT ALL ON TABLE "public"."service_client" TO "authenticated";
GRANT ALL ON TABLE "public"."service_client" TO "service_role";



GRANT ALL ON TABLE "public"."service_types" TO "anon";
GRANT ALL ON TABLE "public"."service_types" TO "authenticated";
GRANT ALL ON TABLE "public"."service_types" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."store_address" TO "anon";
GRANT ALL ON TABLE "public"."store_address" TO "authenticated";
GRANT ALL ON TABLE "public"."store_address" TO "service_role";



GRANT ALL ON TABLE "public"."store_contacts" TO "anon";
GRANT ALL ON TABLE "public"."store_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."store_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."store_products" TO "anon";
GRANT ALL ON TABLE "public"."store_products" TO "authenticated";
GRANT ALL ON TABLE "public"."store_products" TO "service_role";



GRANT ALL ON TABLE "public"."store_suppliers" TO "anon";
GRANT ALL ON TABLE "public"."store_suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."store_suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."stores" TO "anon";
GRANT ALL ON TABLE "public"."stores" TO "authenticated";
GRANT ALL ON TABLE "public"."stores" TO "service_role";



GRANT ALL ON TABLE "public"."supplier_products" TO "anon";
GRANT ALL ON TABLE "public"."supplier_products" TO "authenticated";
GRANT ALL ON TABLE "public"."supplier_products" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."user_team_ids" TO "anon";
GRANT ALL ON TABLE "public"."user_team_ids" TO "authenticated";
GRANT ALL ON TABLE "public"."user_team_ids" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
