--Create BBOX for each feature into a new table
CREATE table Atlas06_Extent as (SELECT cities, luz, (ST_SetSRID(ST_Extent(geom),gid)) as geom FROM urban_atlas_outline GROUP BY gid);

--Add ID
ALTER TABLE Atlas06_Extent ADD COLUMN gid_pk BIGSERIAL PRIMARY KEY;

--Add Projection
UPDATE Atlas06_Extent SET geom  = ST_SetSRID(geom, 3035);