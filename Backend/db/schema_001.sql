-- On a new postgres database the following command might need to be run
-- to install the postgis extension.
--
-- CREATE EXTENSION postgis;
--


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
-- Name: em_public_watchzone; Type: TABLE; Schema: public; Owner: VINE; Tablespace:
--

-- watchZones: [
--     {
--         name: string - name of the watch zone
--         radius: number - radius in metres of the watch zone
--         latitude: number - latitude of the watch zone
--         longitude: number - longitude of the watch zone
--     }
-- ]

CREATE TABLE em_public_watchzone (
    id serial,
    userid character varying(1024),
    name character varying(1024),
    radius integer,
    latitude double precision,
    longitude double precision,
    the_geom geometry
);
CREATE INDEX em_public_watchzone_gist ON em_public_watchzone USING gist (the_geom);
CREATE INDEX em_public_watchzone_pkey ON em_public_watchzone USING btree (id);
CREATE INDEX em_public_watchzone_userid ON em_public_watchzone USING btree (userid);

--
-- Name: em_public_user; Type: TABLE; Schema: public; Owner: VINE; Tablespace:
--

-- userid: string - unique id for the user account
-- password: string - current base64 hash of password
-- firstname: string - user's first name (optional)
-- lastname: string - user's last name (optional)
-- tocVersion: string - last terms and conditions accepted by the user (required)
-- email: string - current active validated email address for the user account (optional - present only if verified)
-- emailChangingTo: string - email address that is currently being validated (optional - present only if being verified)
-- emailValidationCode: string - code used to validate new email address (optional - present only if email is being verified)
-- pwresetValidationCode: string - code used to reset password (optional - present only if pwreset requested)

CREATE TABLE em_public_user (
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
CREATE INDEX em_public_user_email ON em_public_user USING btree (email);
CREATE INDEX em_public_user_email_chg_to ON em_public_user USING btree (email_changing_to);
CREATE INDEX em_public_user_pkey ON em_public_user USING btree (id);
