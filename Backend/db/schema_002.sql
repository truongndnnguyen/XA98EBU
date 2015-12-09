DROP INDEX em_public_watchzone_pkey;
ALTER TABLE em_public_watchzone ADD CONSTRAINT em_public_watchzone_pkey PRIMARY KEY (id);


--
-- Name: m_public_watchzone_filter; Type: TABLE; Schema: public; Owner: VINE; Tablespace:
--

CREATE TABLE em_public_watchzone_filter (
    id serial PRIMARY KEY,
    watchzoneid integer REFERENCES em_public_watchzone (id) ON DELETE CASCADE,
    name character varying(1024)
);
CREATE INDEX em_public_watchzone_filter_name ON em_public_watchzone_filter USING btree (name);
