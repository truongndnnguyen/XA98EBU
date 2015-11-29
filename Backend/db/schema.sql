--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: fireready_watchzones_poly; Type: TABLE; Schema: public; Owner: VINE; Tablespace:
--

-- watchZones: [
--     {
--         name: string - name of the watch zone
--         radius: number - radius in metres of the watch zone
--         latitude: number - latitude of the watch zone
--         longitude: number - longitude of the watch zone
--     }
-- ]

CREATE TABLE fireready_watchzones_poly (
    id integer,
    created_datetime date,
    device_no character varying(65),
    latitude double precision,
    longitude double precision,
    watchzone_name character varying(1024),
    radius integer,
    device_id integer,
    the_geom geometry,
    device_model character varying(32),
    watchzone_local_id bigint,
    radius_flag integer,
    watchzone_index integer
);


ALTER TABLE public.fireready_watchzones_poly OWNER TO "VINE";

--
-- Name: fireready_watchzones_poly_gist; Type: INDEX; Schema: public; Owner: VINE; Tablespace:
--

CREATE INDEX fireready_watchzones_poly_gist ON fireready_watchzones_poly USING gist (the_geom);

--
-- Name: fireready_watchzones_poly_pkey; Type: INDEX; Schema: public; Owner: VINE; Tablespace:
--

CREATE INDEX fireready_watchzones_poly_pkey ON fireready_watchzones_poly USING btree (id);



--
-- Name: fireready_user; Type: TABLE; Schema: public; Owner: VINE; Tablespace:
--

-- id: string - unique id for the user account
-- password: string - current base64 hash of password
-- firstname: string - user's first name (optional)
-- lastname: string - user's last name (optional)
-- tocVersion: string - last terms and conditions accepted by the user (required)
-- email: string - current active validated email address for the user account (optional - present only if verified)
-- emailChangingTo: string - email address that is currently being validated (optional - present only if being verified)
-- emailValidationCode: string - code used to validate new email address (optional - present only if email is being verified)
-- pwresetValidationCode: string - code used to reset password (optional - present only if pwreset requested)


CREATE TABLE fireready_user (
    id character varying(100),
    password character varying(100),
    firstname character varying(100),
    lastname character varying(100),
    toc_version character varying(100),
    email character varying(256),
    email_changing_to character varying(256),
    email_validation_code character varying(100),
    pwreset_validation_code character varying(100)
);

ALTER TABLE public.fireready_user OWNER TO "VINE";

--
-- Name: fireready_user; Type: INDEX; Schema: public; Owner: VINE; Tablespace:
--

CREATE INDEX fireready_user_email ON fireready_user USING btree (email);
CREATE INDEX fireready_user_email_chg_to ON fireready_user USING btree (email_changing_to);

--
-- Name: fireready_user_pkey; Type: INDEX; Schema: public; Owner: VINE; Tablespace:
--

CREATE INDEX fireready_user_pkey ON fireready_user USING btree (id);
