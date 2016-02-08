#
SELECT * FROM type_3fbea3190b634d0c9021d8e67df84187 WHERE landriversegment = 'A42061SJ3_2230_2060' AND landuse = 'alf'

# John's Query Variables
SELECT * FROM type_056e01e3bbf44359866b4861cde24808 WHERE cbwm_lu = 'alf' and best_management_practice_short_name = 'GrassBuffers' and hydrogeomorphic_region = 'Valley and Ridge Siliciclastic'

# Gene's Query Variables
SELECT * FROM type_056e01e3bbf44359866b4861cde24808 WHERE cbwm_lu = 'alf' and best_management_practice_short_name = 'GrassBuffers' and hydrogeomorphic_region = 'Coastal Plain Uplands Non Tidal'



#
#
#
SELECT hgmr_nme FROM 	type_f9d8609090494dac811e6a58eb8ef4be GROUP BY hgmr_nme ORDER BY hgmr_nme


SELECT hydrogeomorphic_region FROM type_056e01e3bbf44359866b4861cde24808 GROUP BY hydrogeomorphic_region ORDER BY hydrogeomorphic_region
