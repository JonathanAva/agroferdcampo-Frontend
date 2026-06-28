export const measurementUnits = [
  { value: 1, label: "metro" },
  { value: 2, label: "Yarda 1" },
  { value: 6, label: "milímetro" },
  { value: 9, label: "kilómetro cuadrado" },
  { value: 10, label: "Hectárea" },
  { value: 13, label: "metro cuadrado" },
  { value: 15, label: "Vara cuadrada 2" },
  { value: 18, label: "metro cúbico" },
  { value: 20, label: "Barril 3" },
  { value: 22, label: "Galón 1, 4" },
  { value: 23, label: "Litro" },
  { value: 24, label: "Botella" },
  { value: 26, label: "Mililitro" },
  { value: 30, label: "Tonelada" },
  { value: 32, label: "Quintal 1" },
  { value: 33, label: "Arroba 1" },
  { value: 34, label: "Kilogramo" },
  { value: 36, label: "Libra 1" },
  { value: 37, label: "Onza troy 5" },
  { value: 38, label: "Onza 1" },
  { value: 39, label: "Gramo" },
  { value: 40, label: "Miligramo" },
  { value: 42, label: "Megawatt" },
  { value: 43, label: "Kilowatt" },
  { value: 44, label: "Watt" },
  { value: 45, label: "Megavoltio-amperio" },
  { value: 46, label: "Kilovoltio-amperio" },
  { value: 47, label: "Voltio-amperio" },
  { value: 49, label: "Gigawatt-hora" },
  { value: 50, label: "Megawatt-hora" },
  { value: 51, label: "Kilowatt-hora" },
  { value: 52, label: "Watt-hora" },
  { value: 53, label: "Kilovoltio" },
  { value: 54, label: "Voltio" },
  { value: 55, label: "Millar" },
  { value: 56, label: "Medio millar" },
  { value: 57, label: "Ciento" },
  { value: 58, label: "Docena" },
  { value: 59, label: "Unidad" },
  { value: 99, label: "Otra 6" },
];

export const itemCategories = [
  { value: 1, label: "Bienes" },
  { value: 2, label: "Servicios" },
  {
    value: 3,
    label:
      "Ambos (Bienes y Servicios, incluye los dos inherente a los Productos o servicios)",
  },
  { value: 4, label: "Otros tributos por ítem" },
];

export const documentTypes = [
  { value: "36", label: "NIT" },
  { value: "13", label: "DUI" },
  { value: "37", label: "Otro" },
  { value: "03", label: "Pasaporte" },
  { value: "02", label: "Carnet de Residente" },
];

export const departments = [
  { value: "00", label: "Otro (Para extranjeros)" },
  { value: "01", label: "Ahuachapán" },
  { value: "02", label: "Santa Ana" },
  { value: "03", label: "Sonsonate" },
  { value: "04", label: "Chalatenango" },
  { value: "05", label: "La Libertad" },
  { value: "06", label: "San Salvador" },
  { value: "07", label: "Cuscatlán" },
  { value: "08", label: "La Paz" },
  { value: "09", label: "Cabañas" },
  { value: "10", label: "San Vicente" },
  { value: "11", label: "Usulután" },
  { value: "12", label: "San Miguel" },
  { value: "13", label: "Morazán" },
  { value: "14", label: "La Unión" },
];

export const zones = [
  { value: "00", label: "Otro (Para extranjeros)", departmentId: "00" },
  { value: "13", label: "AHUACHAPAN NORTE", departmentId: "01" },
  { value: "14", label: "AHUACHAPAN CENTRO", departmentId: "01" },
  { value: "15", label: "AHUACHAPAN SUR", departmentId: "01" },
  { value: "14", label: "SANTA ANA NORTE", departmentId: "02" },
  { value: "15", label: "SANTA ANA CENTRO", departmentId: "02" },
  { value: "16", label: "SANTA ANA ESTE", departmentId: "02" },
  { value: "17", label: "SANTA ANA OESTE", departmentId: "02" },
  { value: "17", label: "SONSONATE NORTE", departmentId: "03" },
  { value: "18", label: "SONSONATE CENTRO", departmentId: "03" },
  { value: "19", label: "SONSONATE ESTE", departmentId: "03" },
  { value: "20", label: "SONSONATE OESTE", departmentId: "03" },
  { value: "34", label: "CHALATENANGO NORTE", departmentId: "04" },
  { value: "35", label: "CHALATENANGO CENTRO", departmentId: "04" },
  { value: "36", label: "CHALATENANGO SUR", departmentId: "04" },
  { value: "23", label: "LA LIBERTAD NORTE", departmentId: "05" },
  { value: "24", label: "LA LIBERTAD CENTRO", departmentId: "05" },
  { value: "25", label: "LA LIBERTAD OESTE", departmentId: "05" },
  { value: "26", label: "LA LIBERTAD ESTE", departmentId: "05" },
  { value: "27", label: "LA LIBERTAD COSTA", departmentId: "05" },
  { value: "28", label: "LA LIBERTAD SUR", departmentId: "05" },
  { value: "20", label: "SAN SALVADOR NORTE", departmentId: "06" },
  { value: "21", label: "SAN SALVADOR OESTE", departmentId: "06" },
  { value: "22", label: "SAN SALVADOR ESTE", departmentId: "06" },
  { value: "23", label: "SAN SALVADOR CENTRO", departmentId: "06" },
  { value: "24", label: "SAN SALVADOR SUR", departmentId: "06" },
  { value: "17", label: "CUSCATLAN NORTE", departmentId: "07" },
  { value: "18", label: "CUSCATLAN SUR", departmentId: "07" },
  { value: "23", label: "LA PAZ OESTE", departmentId: "08" },
  { value: "24", label: "LA PAZ CENTRO", departmentId: "08" },
  { value: "25", label: "LA PAZ ESTE", departmentId: "08" },
  { value: "10", label: "CABAÑAS OESTE", departmentId: "09" },
  { value: "11", label: "CABAÑAS ESTE", departmentId: "09" },
  { value: "14", label: "SAN VICENTE NORTE", departmentId: "10" },
  { value: "15", label: "SAN VICENTE SUR", departmentId: "10" },
  { value: "24", label: "USULUTAN NORTE", departmentId: "11" },
  { value: "25", label: "USULUTAN ESTE", departmentId: "11" },
  { value: "26", label: "USULUTAN OESTE", departmentId: "11" },
  { value: "21", label: "SAN MIGUEL NORTE", departmentId: "12" },
  { value: "22", label: "SAN MIGUEL CENTRO", departmentId: "12" },
  { value: "23", label: "SAN MIGUEL OESTE", departmentId: "12" },
  { value: "27", label: "MORAZAN NORTE", departmentId: "13" },
  { value: "28", label: "MORAZAN SUR", departmentId: "13" },
  { value: "19", label: "LA UNION NORTE", departmentId: "14" },
  { value: "20", label: "LA UNION SUR", departmentId: "14" },
];

export const districts = [
  // Ahuachapán
  { value: "01", label: "AHUACHAPÁN", departmentId: "01" },
  { value: "02", label: "APANECA", departmentId: "01" },
  { value: "03", label: "ATIQUIZAYA", departmentId: "01" },
  { value: "04", label: "CONCEPCIÓN DE ATACO", departmentId: "01" },
  { value: "05", label: "EL REFUGIO", departmentId: "01" },
  { value: "06", label: "GUAYMANGO", departmentId: "01" },
  { value: "07", label: "JUJUTLA", departmentId: "01" },
  { value: "08", label: "SAN FRANCISCO MENÉNDEZ", departmentId: "01" },
  { value: "09", label: "SAN LORENZO", departmentId: "01" },
  { value: "10", label: "SAN PEDRO PUXTLA", departmentId: "01" },
  { value: "11", label: "TACUBA", departmentId: "01" },
  { value: "12", label: "TURÍN", departmentId: "01" },
  // Santa Ana
  { value: "01", label: "CANDELARIA DE LA FRONTERA", departmentId: "02" },
  { value: "02", label: "COATEPEQUE", departmentId: "02" },
  { value: "03", label: "CHALCHUAPA", departmentId: "02" },
  { value: "04", label: "EL CONGO", departmentId: "02" },
  { value: "05", label: "EL PORVENIR", departmentId: "02" },
  { value: "06", label: "MASAHUAT", departmentId: "02" },
  { value: "07", label: "METAPÁN", departmentId: "02" },
  { value: "08", label: "SAN ANTONIO PAJONAL", departmentId: "02" },
  { value: "09", label: "SAN SEBASTIÁN SALITRILLO", departmentId: "02" },
  { value: "10", label: "SANTA ANA", departmentId: "02" },
  { value: "11", label: "STA ROSA GUACHI", departmentId: "02" },
  { value: "12", label: "STGO D LA FRONT", departmentId: "02" },
  { value: "13", label: "TEXISTEPEQUE", departmentId: "02" },
  // Sonsonate
  { value: "01", label: "ACAJUTLA", departmentId: "03" },
  { value: "02", label: "ARMENIA", departmentId: "03" },
  { value: "03", label: "CALUCO", departmentId: "03" },
  { value: "04", label: "CUISNAHUAT", departmentId: "03" },
  { value: "05", label: "STA I ISHUATAN", departmentId: "03" },
  { value: "06", label: "IZALCO", departmentId: "03" },
  { value: "07", label: "JUAYÚA", departmentId: "03" },
  { value: "08", label: "NAHUIZALCO", departmentId: "03" },
  { value: "09", label: "NAHULINGO", departmentId: "03" },
  { value: "10", label: "SALCOATITÁN", departmentId: "03" },
  { value: "11", label: "SAN ANTONIO DEL MONTE", departmentId: "03" },
  { value: "12", label: "SAN JULIÁN", departmentId: "03" },
  { value: "13", label: "STA C MASAHUAT", departmentId: "03" },
  { value: "14", label: "SANTO DOMINGO GUZMÁN", departmentId: "03" },
  { value: "15", label: "SONSONATE", departmentId: "03" },
  { value: "16", label: "SONZACATE", departmentId: "03" },
  // Chalatenango
  { value: "01", label: "AGUA CALIENTE", departmentId: "04" },
  { value: "02", label: "ARCATAO", departmentId: "04" },
  { value: "03", label: "AZACUALPA", departmentId: "04" },
  { value: "04", label: "CITALÁ", departmentId: "04" },
  { value: "05", label: "COMALAPA", departmentId: "04" },
  { value: "06", label: "CONCEPCIÓN QUEZALTEPEQUE", departmentId: "04" },
  { value: "07", label: "CHALATENANGO", departmentId: "04" },
  { value: "08", label: "DULCE NOM MARÍA", departmentId: "04" },
  { value: "09", label: "EL CARRIZAL", departmentId: "04" },
  { value: "10", label: "EL PARAÍSO", departmentId: "04" },
  { value: "11", label: "LA LAGUNA", departmentId: "04" },
  { value: "12", label: "LA PALMA", departmentId: "04" },
  { value: "13", label: "LA REINA", departmentId: "04" },
  { value: "14", label: "LAS VUELTAS", departmentId: "04" },
  { value: "15", label: "NOMBRE DE JESUS", departmentId: "04" },
  { value: "16", label: "NVA CONCEPCIÓN", departmentId: "04" },
  { value: "17", label: "NUEVA TRINIDAD", departmentId: "04" },
  { value: "18", label: "OJOS DE AGUA", departmentId: "04" },
  { value: "19", label: "POTONICO", departmentId: "04" },
  { value: "20", label: "SAN ANT LA CRUZ", departmentId: "04" },
  { value: "21", label: "SAN ANT RANCHOS", departmentId: "04" },
  { value: "22", label: "SAN FERNANDO", departmentId: "04" },
  { value: "23", label: "SAN FRANCISCO LEMPA", departmentId: "04" },
  { value: "24", label: "SAN FRANCISCO MORAZÁN", departmentId: "04" },
  { value: "25", label: "SAN IGNACIO", departmentId: "04" },
  { value: "26", label: "SAN I LABRADOR", departmentId: "04" },
  { value: "27", label: "SAN J CANCASQUE", departmentId: "04" },
  { value: "28", label: "SAN JOSE FLORES", departmentId: "04" },
  { value: "29", label: "SAN LUIS CARMEN", departmentId: "04" },
  { value: "30", label: "SN MIG MERCEDES", departmentId: "04" },
  { value: "31", label: "SAN RAFAEL", departmentId: "04" },
  { value: "32", label: "SANTA RITA", departmentId: "04" },
  { value: "33", label: "TEJUTLA", departmentId: "04" },
  // La Libertad
  { value: "01", label: "ANTGO CUSCATLÁN", departmentId: "05" },
  { value: "02", label: "CIUDAD ARCE", departmentId: "05" },
  { value: "03", label: "COLON", departmentId: "05" },
  { value: "04", label: "COMASAGUA", departmentId: "05" },
  { value: "05", label: "CHILTIUPAN", departmentId: "05" },
  { value: "06", label: "HUIZÚCAR", departmentId: "05" },
  { value: "07", label: "JAYAQUE", departmentId: "05" },
  { value: "08", label: "JICALAPA", departmentId: "05" },
  { value: "09", label: "LA LIBERTAD", departmentId: "05" },
  { value: "10", label: "NUEVO CUSCATLÁN", departmentId: "05" },
  { value: "11", label: "SANTA TECLA", departmentId: "05" },
  { value: "12", label: "QUEZALTEPEQUE", departmentId: "05" },
  { value: "13", label: "SACACOYO", departmentId: "05" },
  { value: "14", label: "SN J VILLANUEVA", departmentId: "05" },
  { value: "15", label: "SAN JUAN OPICO", departmentId: "05" },
  { value: "16", label: "SAN MATÍAS", departmentId: "05" },
  { value: "17", label: "SAN P TACACHICO", departmentId: "05" },
  { value: "18", label: "TAMANIQUE", departmentId: "05" },
  { value: "19", label: "TALNIQUE", departmentId: "05" },
  { value: "20", label: "TEOTEPEQUE", departmentId: "05" },
  { value: "21", label: "TEPECOYO", departmentId: "05" },
  { value: "22", label: "ZARAGOZA", departmentId: "05" },
  // San Salvador
  { value: "01", label: "AGUILARES", departmentId: "06" },
  { value: "02", label: "APOPA", departmentId: "06" },
  { value: "03", label: "AYUTUXTEPEQUE", departmentId: "06" },
  { value: "04", label: "CUSCATANCINGO", departmentId: "06" },
  { value: "05", label: "EL PAISNAL", departmentId: "06" },
  { value: "06", label: "GUAZAPA", departmentId: "06" },
  { value: "07", label: "ILOPANGO", departmentId: "06" },
  { value: "08", label: "MEJICANOS", departmentId: "06" },
  { value: "09", label: "NEJAPA", departmentId: "06" },
  { value: "10", label: "PANCHIMALCO", departmentId: "06" },
  { value: "11", label: "ROSARIO DE MORA", departmentId: "06" },
  { value: "12", label: "SAN MARCOS", departmentId: "06" },
  { value: "13", label: "SAN MARTIN", departmentId: "06" },
  { value: "14", label: "SAN SALVADOR", departmentId: "06" },
  { value: "15", label: "STG TEXACUANGOS", departmentId: "06" },
  { value: "16", label: "SANTO TOMAS", departmentId: "06" },
  { value: "17", label: "SOYAPANGO", departmentId: "06" },
  { value: "18", label: "TONACATEPEQUE", departmentId: "06" },
  { value: "19", label: "CIUDAD DELGADO", departmentId: "06" },
  // Cuscatlán
  { value: "01", label: "CANDELARIA", departmentId: "07" },
  { value: "02", label: "COJUTEPEQUE", departmentId: "07" },
  { value: "03", label: "EL CARMEN", departmentId: "07" },
  { value: "04", label: "EL ROSARIO", departmentId: "07" },
  { value: "05", label: "MONTE SAN JUAN", departmentId: "07" },
  { value: "06", label: "ORAT CONCEPCIÓN", departmentId: "07" },
  { value: "07", label: "SAN B PERULAPIA", departmentId: "07" },
  { value: "08", label: "SAN CRISTÓBAL", departmentId: "07" },
  { value: "09", label: "SAN J GUAYABAL", departmentId: "07" },
  { value: "10", label: "SAN P PERULAPÁN", departmentId: "07" },
  { value: "11", label: "SAN RAF CEDROS", departmentId: "07" },
  { value: "12", label: "SAN RAMON", departmentId: "07" },
  { value: "13", label: "STA C ANALQUITO", departmentId: "07" },
  { value: "14", label: "STA C MICHAPA", departmentId: "07" },
  { value: "15", label: "SUCHITOTO", departmentId: "07" },
  { value: "16", label: "TENANCINGO", departmentId: "07" },
  // La Paz
  { value: "01", label: "CUYULTITÁN", departmentId: "08" },
  { value: "02", label: "EL ROSARIO", departmentId: "08" },
  { value: "03", label: "JERUSALÉN", departmentId: "08" },
  { value: "04", label: "MERCED LA CEIBA", departmentId: "08" },
  { value: "05", label: "OLOCUILTA", departmentId: "08" },
  { value: "06", label: "PARAÍSO OSORIO", departmentId: "08" },
  { value: "07", label: "SN ANT MASAHUAT", departmentId: "08" },
  { value: "08", label: "SAN EMIGDIO", departmentId: "08" },
  { value: "09", label: "SN FCO CHINAMEC", departmentId: "08" },
  { value: "10", label: "SAN J NONUALCO", departmentId: "08" },
  { value: "11", label: "SAN JUAN TALPA", departmentId: "08" },
  { value: "12", label: "SAN JUAN TEPEZONTES", departmentId: "08" },
  { value: "13", label: "SAN LUIS TALPA", departmentId: "08" },
  { value: "14", label: "SAN MIGUEL TEPEZONTES", departmentId: "08" },
  { value: "15", label: "SAN PEDRO MASAHUAT", departmentId: "08" },
  { value: "16", label: "SAN PEDRO NONUALCO", departmentId: "08" },
  { value: "17", label: "SAN R OBRAJUELO", departmentId: "08" },
  { value: "18", label: "STA MA OSTUMA", departmentId: "08" },
  { value: "19", label: "STGO NONUALCO", departmentId: "08" },
  { value: "20", label: "TAPALHUACA", departmentId: "08" },
  { value: "21", label: "ZACATECOLUCA", departmentId: "08" },
  { value: "22", label: "SN LUIS LA HERR", departmentId: "08" },
  // Cabañas
  { value: "01", label: "CINQUERA", departmentId: "09" },
  { value: "02", label: "GUACOTECTI", departmentId: "09" },
  { value: "03", label: "ILOBASCO", departmentId: "09" },
  { value: "04", label: "JUTIAPA", departmentId: "09" },
  { value: "05", label: "SAN ISIDRO", departmentId: "09" },
  { value: "06", label: "SENSUNTEPEQUE", departmentId: "09" },
  { value: "07", label: "TEJUTEPEQUE", departmentId: "09" },
  { value: "08", label: "VICTORIA", departmentId: "09" },
  { value: "09", label: "DOLORES", departmentId: "09" },
  // San Vicente
  { value: "01", label: "APASTEPEQUE", departmentId: "10" },
  { value: "02", label: "GUADALUPE", departmentId: "10" },
  { value: "03", label: "SAN CAY ISTEPEQ", departmentId: "10" },
  { value: "04", label: "SANTA CLARA", departmentId: "10" },
  { value: "05", label: "SANTO DOMINGO", departmentId: "10" },
  { value: "06", label: "SN EST CATARINA", departmentId: "10" },
  { value: "07", label: "SAN ILDEFONSO", departmentId: "10" },
  { value: "08", label: "SAN LORENZO", departmentId: "10" },
  { value: "09", label: "SAN SEBASTIÁN", departmentId: "10" },
  { value: "10", label: "SAN VICENTE", departmentId: "10" },
  { value: "11", label: "TECOLUCA", departmentId: "10" },
  { value: "12", label: "TEPETITÁN", departmentId: "10" },
  { value: "13", label: "VERAPAZ", departmentId: "10" },
  // Usulután
  { value: "01", label: "ALEGRÍA", departmentId: "11" },
  { value: "02", label: "BERLÍN", departmentId: "11" },
  { value: "03", label: "CALIFORNIA", departmentId: "11" },
  { value: "04", label: "CONCEP BATRES", departmentId: "11" },
  { value: "05", label: "EL TRIUNFO", departmentId: "11" },
  { value: "06", label: "EREGUAYQUÍN", departmentId: "11" },
  { value: "07", label: "ESTANZUELAS", departmentId: "11" },
  { value: "08", label: "JIQUILISCO", departmentId: "11" },
  { value: "09", label: "JUCUAPA", departmentId: "11" },
  { value: "10", label: "JUCUARÁN", departmentId: "11" },
  { value: "11", label: "MERCEDES UMAÑA", departmentId: "11" },
  { value: "12", label: "NUEVA GRANADA", departmentId: "11" },
  { value: "13", label: "OZATLÁN", departmentId: "11" },
  { value: "14", label: "PTO EL TRIUNFO", departmentId: "11" },
  { value: "15", label: "SAN AGUSTÍN", departmentId: "11" },
  { value: "16", label: "SN BUENAVENTURA", departmentId: "11" },
  { value: "17", label: "SAN DIONISIO", departmentId: "11" },
  { value: "18", label: "SANTA ELENA", departmentId: "11" },
  { value: "19", label: "SAN FCO JAVIER", departmentId: "11" },
  { value: "20", label: "SANTA MARÍA", departmentId: "11" },
  { value: "21", label: "STGO DE MARÍA", departmentId: "11" },
  { value: "22", label: "TECAPÁN", departmentId: "11" },
  { value: "23", label: "USULUTÁN", departmentId: "11" },
  // San Miguel
  { value: "01", label: "CAROLINA", departmentId: "12" },
  { value: "02", label: "CIUDAD BARRIOS", departmentId: "12" },
  { value: "03", label: "COMACARÁN", departmentId: "12" },
  { value: "04", label: "CHAPELTIQUE", departmentId: "12" },
  { value: "05", label: "CHINAMECA", departmentId: "12" },
  { value: "06", label: "CHIRILAGUA", departmentId: "12" },
  { value: "07", label: "EL TRANSITO", departmentId: "12" },
  { value: "08", label: "LOLOTIQUE", departmentId: "12" },
  { value: "09", label: "MONCAGUA", departmentId: "12" },
  { value: "10", label: "NUEVA GUADALUPE", departmentId: "12" },
  { value: "11", label: "NVO EDÉN S JUAN", departmentId: "12" },
  { value: "12", label: "QUELEPA", departmentId: "12" },
  { value: "13", label: "SAN ANT D MOSCO", departmentId: "12" },
  { value: "14", label: "SAN GERARDO", departmentId: "12" },
  { value: "15", label: "SAN JORGE", departmentId: "12" },
  { value: "16", label: "SAN LUIS REINA", departmentId: "12" },
  { value: "17", label: "SAN MIGUEL", departmentId: "12" },
  { value: "18", label: "SAN RAF ORIENTE", departmentId: "12" },
  { value: "19", label: "SESORI", departmentId: "12" },
  { value: "20", label: "ULUAZAPA", departmentId: "12" },
  // Morazán
  { value: "01", label: "ARAMBALA", departmentId: "13" },
  { value: "02", label: "CACAOPERA", departmentId: "13" },
  { value: "03", label: "CORINTO", departmentId: "13" },
  { value: "04", label: "CHILANGA", departmentId: "13" },
  { value: "05", label: "DELIC DE CONCEP", departmentId: "13" },
  { value: "06", label: "EL DIVISADERO", departmentId: "13" },
  { value: "07", label: "EL ROSARIO", departmentId: "13" },
  { value: "08", label: "GUALOCOCTI", departmentId: "13" },
  { value: "09", label: "GUATAJIAGUA", departmentId: "13" },
  { value: "10", label: "JOATECA", departmentId: "13" },
  { value: "11", label: "JOCOAITIQUE", departmentId: "13" },
  { value: "12", label: "JOCORO", departmentId: "13" },
  { value: "13", label: "LOLOTIQUILLO", departmentId: "13" },
  { value: "14", label: "MEANGUERA", departmentId: "13" },
  { value: "15", label: "OSICALA", departmentId: "13" },
  { value: "16", label: "PERQUÍN", departmentId: "13" },
  { value: "17", label: "SAN CARLOS", departmentId: "13" },
  { value: "18", label: "SAN FERNANDO", departmentId: "13" },
  { value: "19", label: "SAN FCO GOTERA", departmentId: "13" },
  { value: "20", label: "SAN ISIDRO", departmentId: "13" },
  { value: "21", label: "SAN SIMÓN", departmentId: "13" },
  { value: "22", label: "SENSEMBRA", departmentId: "13" },
  { value: "23", label: "SOCIEDAD", departmentId: "13" },
  { value: "24", label: "TOROLA", departmentId: "13" },
  { value: "25", label: "YAMABAL", departmentId: "13" },
  { value: "26", label: "YOLOAIQUÍN", departmentId: "13" },
  // La Unión
  { value: "01", label: "ANAMOROS", departmentId: "14" },
  { value: "02", label: "BOLÍVAR", departmentId: "14" },
  { value: "03", label: "CONCEP DE OTE", departmentId: "14" },
  { value: "04", label: "CONCHAGUA", departmentId: "14" },
  { value: "05", label: "EL CARMEN", departmentId: "14" },
  { value: "06", label: "EL SAUCE", departmentId: "14" },
  { value: "07", label: "INTIPUCÁ", departmentId: "14" },
  { value: "08", label: "LA UNIÓN", departmentId: "14" },
  { value: "09", label: "LISLIQUE", departmentId: "14" },
  { value: "10", label: "MEANG DEL GOLFO", departmentId: "14" },
  { value: "11", label: "NUEVA ESPARTA", departmentId: "14" },
  { value: "12", label: "PASAQUINA", departmentId: "14" },
  { value: "13", label: "POLORÓS", departmentId: "14" },
  { value: "14", label: "SAN ALEJO", departmentId: "14" },
  { value: "15", label: "SAN JOSE", departmentId: "14" },
  { value: "16", label: "SANTA ROSA LIMA", departmentId: "14" },
  { value: "17", label: "YAYANTIQUE", departmentId: "14" },
  { value: "18", label: "YUCUAIQUÍN", departmentId: "14" },
];
export const economicActivities = [
  { value: "A", label: "AGRICULTURA, GANADERÍA, SILVICULTURA Y PESCA" },
  {
    value: "01",
    label:
      "PRODUCCIÓN AGRÍCOLA, PECUARIA, CAZA Y ACTIVIDADES DE SERVICIOS CONEXAS",
  },
  {
    value: "01111",
    label: "Cultivo de cereales excepto arroz y para forrajes",
  },
  { value: "01112", label: "Cultivo de legumbres" },
  { value: "01113", label: "Cultivo de semillas oleaginosas" },
  {
    value: "01114",
    label: "Cultivo de plantas para la preparación de semillas",
  },
  {
    value: "01119",
    label: "Cultivo de otros cereales excepto arroz y forrajeros n.c.p.",
  },
  { value: "01120", label: "Cultivo de arroz" },
  { value: "01131", label: "Cultivo de raíces y tubérculos" },
  {
    value: "01132",
    label:
      "Cultivo de brotes, bulbos, vegetales tubérculos y cultivos similares",
  },
  { value: "01133", label: "Cultivo hortícola de fruto" },
  {
    value: "01134",
    label: "Cultivo de hortalizas de hoja y otras hortalizas ncp",
  },
  { value: "01140", label: "Cultivo de caña de azúcar" },
  { value: "01150", label: "Cultivo de tabaco" },
  { value: "01161", label: "Cultivo de algodón" },
  { value: "01162", label: "Cultivo de fibras vegetales excepto algodón" },
  {
    value: "01191",
    label:
      "Cultivo de plantas no perennes para la producción de semillas y flores",
  },
  {
    value: "01192",
    label: "Cultivo de cereales y pastos para la alimentación animal",
  },
  { value: "01199", label: "Producción de cultivos no estacionales ncp" },
  { value: "01220", label: "Cultivo de frutas tropicales" },
  { value: "01230", label: "Cultivo de cítricos" },
  { value: "01240", label: "Cultivo de frutas de pepita y hueso" },
  { value: "01251", label: "Cultivo de frutas ncp" },
  {
    value: "01252",
    label: "Cultivo de otros frutos y nueces de árboles y arbustos",
  },
  { value: "01260", label: "Cultivo de frutos oleaginosos" },
  { value: "01271", label: "Cultivo de café" },
  {
    value: "01272",
    label: "Cultivo de plantas para la elaboración de bebidas excepto café",
  },
  { value: "01281", label: "Cultivo de especias y aromáticas" },
  {
    value: "01282",
    label:
      "Cultivo de plantas para la obtención de productos medicinales y farmacéuticos",
  },
  {
    value: "01291",
    label: "Cultivo de árboles de hule (caucho) para la obtención de látex",
  },
  {
    value: "01292",
    label:
      "Cultivo de plantas para la obtención de productos químicos y colorantes",
  },
  { value: "01299", label: "Producción de cultivos perennes ncp" },
  { value: "01300", label: "Propagación de plantas" },
  { value: "01301", label: "Cultivo de plantas y flores ornamentales" },
  { value: "01410", label: "Cría y engorde de ganado bovino" },
  { value: "01420", label: "Cría de caballos y otros equinos" },
  { value: "01440", label: "Cría de ovejas y cabras" },
  { value: "01450", label: "Cría de cerdos" },
  { value: "01460", label: "Cría de aves de corral y producción de huevos" },
  {
    value: "01491",
    label:
      "Cría de abejas apicultura para la obtención de miel y otros productos apícolas",
  },
  { value: "01492", label: "Cría de conejos" },
  { value: "01493", label: "Cría de iguanas y garrobos" },
  { value: "01494", label: "Cría de mariposas y otros insectos" },
  { value: "01499", label: "Cría y obtención de productos animales n.c.p." },
  {
    value: "01500",
    label:
      "Cultivo de productos agrícolas en combinación con la cría de animales",
  },
  { value: "01611", label: "Servicios de maquinaria agrícola" },
  { value: "01612", label: "Control de plagas" },
  { value: "01613", label: "Servicios de riego" },
  {
    value: "01614",
    label: "Servicios de contratación de mano de obra para la agricultura",
  },
  { value: "01619", label: "Servicios agrícolas ncp" },
  {
    value: "01621",
    label:
      "Actividades para mejorar la reproducción, el crecimiento y el rendimiento de los animales y sus productos",
  },
  { value: "01622", label: "Servicios de mano de obra pecuaria" },
  { value: "01629", label: "Servicios pecuarios ncp" },
  {
    value: "01631",
    label:
      "Labores post cosecha de preparación de los productos agrícolas para su comercialización o para la industria",
  },
  { value: "01632", label: "Servicio de beneficio de café" },
  {
    value: "01633",
    label:
      "Servicio de beneficiado de plantas textiles (incluye el beneficiado cuando este es realizado en la misma explotación agropecuaria)",
  },
  { value: "01640", label: "Tratamiento de semillas para la propagación" },
  {
    value: "01700",
    label:
      "Caza ordinaria y mediante trampas, repoblación de animales de caza y servicios conexos",
  },
  { value: "02", label: "SILVICULTURA Y EXTRACCIÓN DE MADERA" },
  { value: "02100", label: "Silvicultura y otras actividades forestales" },
  { value: "02200", label: "Extracción de madera" },
  { value: "02300", label: "Recolección de productos diferentes a la madera" },
  { value: "02400", label: "Servicios de apoyo a la silvicultura" },
  { value: "03", label: "PESCA Y ACUICULTURA" },
  { value: "03110", label: "Pesca marítima de altura y costera" },
  { value: "03120", label: "Pesca de agua dulce" },
  { value: "03210", label: "Acuicultura marítima" },
  { value: "03220", label: "Acuicultura de agua dulce" },
  { value: "03300", label: "Servicios de apoyo a la pesca y acuicultura" },
  { value: "B", label: "EXPLOTACIÓN DE MINAS Y CANTERAS" },
  { value: "05", label: "EXTRACCIÓN CARBÓN DE PIEDRA Y LIGNITO" },
  { value: "05100", label: "Extracción de hulla" },
  { value: "05200", label: "Extracción y aglomeración de lignito" },
  { value: "06", label: "EXTRACCIÓN DE PETRÓLEO CRUDO Y GAS NATURAL" },
  { value: "06100", label: "Extracción de petróleo crudo" },
  { value: "06200", label: "Extracción de gas natural" },
  { value: "07", label: "EXTRACCIÓN DE MINERALES METALÍFEROS" },
  { value: "07100", label: "Extracción de minerales de hierro" },
  { value: "07210", label: "Extracción de minerales de uranio y torio" },
  { value: "07290", label: "Extracción de minerales metalíferos no ferrosos" },
  { value: "08", label: "EXPLOTACIÓN DE OTRAS MINAS Y CANTERAS" },
  { value: "08100", label: "Extracción de piedra, arena y arcilla" },
  {
    value: "08910",
    label:
      "Extracción de minerales para la fabricación de abonos y productos químicos",
  },
  { value: "08920", label: "Extracción y aglomeración de turba" },
  { value: "08930", label: "Extracción de sal" },
  { value: "08990", label: "Explotación de otras minas y canteras ncp" },
  {
    value: "09",
    label:
      "ACTIVIDADES DE SERVICIOS DE APOYO A LA EXPLOTACIÓN DE MINAS Y CANTERAS",
  },
  {
    value: "09100",
    label: "Actividades de apoyo a la extracción de petróleo y gas natural",
  },
  {
    value: "09900",
    label: "Actividades de apoyo a la explotación de minas y canteras",
  },
  { value: "C", label: "INDUSTRIAS MANUFACTURERAS" },
  { value: "10", label: "ELABORACIÓN DE PRODUCTOS ALIMENTICIOS" },
  {
    value: "10101",
    label: "Servicio de rastros y mataderos de bovinos y porcinos",
  },
  { value: "10102", label: "Matanza y procesamiento de bovinos y porcinos" },
  { value: "10103", label: "Matanza y procesamientos de aves de corral" },
  {
    value: "10104",
    label: "Elaboración y conservación de embutidos y tripas naturales",
  },
  { value: "10105", label: "Servicios de conservación y empaque de carnes" },
  {
    value: "10106",
    label: "Elaboración y conservación de grasas y aceites animales",
  },
  { value: "10107", label: "Servicios de molienda de carne" },
  { value: "10108", label: "Elaboración de productos de carne ncp" },
  {
    value: "10201",
    label: "Procesamiento y conservación de pescado, crustáceos y moluscos",
  },
  { value: "10209", label: "Fabricación de productos de pescado ncp" },
  { value: "10301", label: "Elaboración de jugos de frutas y hortalizas" },
  {
    value: "10302",
    label: "Elaboración y envase de jaleas, mermeladas y frutas deshidratadas",
  },
  {
    value: "10309",
    label: "Elaboración de productos de frutas y hortalizas n.c.p.",
  },
  {
    value: "10401",
    label: "Fabricación de aceites y grasas vegetales y animales comestibles",
  },
  {
    value: "10402",
    label:
      "Fabricación de aceites y grasas vegetales y animales no comestibles",
  },
  { value: "10409", label: "Servicio de maquilado de aceites" },
  {
    value: "10501",
    label:
      "Fabricación de productos lácteos excepto sorbetes y quesos sustitutos",
  },
  { value: "10502", label: "Fabricación de sorbetes y helados" },
  { value: "10503", label: "Fabricación de quesos" },
  { value: "10611", label: "Molienda de cereales" },
  {
    value: "10612",
    label: "Elaboración de cereales para el desayuno y similares",
  },
  {
    value: "10613",
    label:
      "Servicios de beneficiado de productos agrícolas ncp (excluye Beneficio de azúcar rama 1072 y beneficio de café rama 0163)",
  },
  { value: "10621", label: "Fabricación de almidón" },
  {
    value: "10628",
    label: "Servicio de molienda de maíz húmedo molino para nixtamal",
  },
  { value: "10711", label: "Elaboración de tortillas" },
  { value: "10712", label: "Fabricación de pan, galletas y barquillos" },
  { value: "10713", label: "Fabricación de repostería" },
  { value: "10721", label: "Ingenios azucareros" },
  {
    value: "10722",
    label: "Molienda de caña de azúcar para la elaboración de dulces",
  },
  {
    value: "10723",
    label: "Elaboración de jarabes de azúcar y otros similares",
  },
  { value: "10724", label: "Maquilado de azúcar de caña" },
  {
    value: "10730",
    label: "Fabricación de cacao, chocolates y productos de confitería",
  },
  {
    value: "10740",
    label:
      "Elaboración de macarrones, fideos, y productos farináceos similares",
  },
  {
    value: "10750",
    label:
      "Elaboración de comidas y platos preparados para la reventa en locales y/o para exportación",
  },
  { value: "10791", label: "Elaboración de productos de café" },
  {
    value: "10792",
    label: "Elaboración de especies, sazonadores y condimentos",
  },
  { value: "10793", label: "Elaboración de sopas, cremas y consomé" },
  { value: "10794", label: "Fabricación de bocadillos tostados y/o fritos" },
  { value: "10799", label: "Elaboración de productos alimenticios ncp" },
  {
    value: "10800",
    label: "Elaboración de alimentos preparados para animales",
  },
  { value: "11", label: "ELABORACIÓN DE BEBIDAS" },
  { value: "11012", label: "Fabricación de aguardiente y licores" },
  { value: "11020", label: "Elaboración de vinos" },
  { value: "11030", label: "Fabricación de cerveza" },
  { value: "11041", label: "Fabricación de aguas gaseosas" },
  { value: "11042", label: "Fabricación y envasado de agua" },
  { value: "11043", label: "Elaboración de refrescos" },
  { value: "11048", label: "Maquilado de aguas gaseosas" },
  { value: "11049", label: "Elaboración de bebidas no alcohólicas" },
  { value: "12", label: "ELABORACIÓN DE PRODUCTOS DE TABACO" },
  { value: "12000", label: "Elaboración de productos de tabaco" },
  { value: "13", label: "FABRICACIÓN DE PRODUCTOS TEXTILES" },
  { value: "13111", label: "Preparación de fibras textiles" },
  { value: "13112", label: "Fabricación de hilados" },
  { value: "13120", label: "Fabricación de telas" },
  { value: "13130", label: "Acabado de productos textiles" },
  { value: "13910", label: "Fabricación de tejidos de punto y ganchillo" },
  { value: "13921", label: "Fabricación de productos textiles para el hogar" },
  { value: "13922", label: "Sacos, bolsas y otros artículos textiles" },
  {
    value: "13929",
    label:
      "Fabricación de artículos confeccionados con materiales textiles, excepto prendas de vestir n.c.p",
  },
  { value: "13930", label: "Fabricación de tapices y alfombras" },
  {
    value: "13941",
    label:
      "Fabricación de cuerdas de henequén y otras fibras naturales (lazos, pitas)",
  },
  { value: "13942", label: "Fabricación de redes de diversos materiales" },
  {
    value: "13948",
    label:
      "Maquilado de productos trenzables de cualquier material (petates, sillas, etc.)",
  },
  {
    value: "13991",
    label:
      "Fabricación de adornos, etiquetas y otros artículos para prendas de vestir",
  },
  {
    value: "13992",
    label: "Servicio de bordados en artículos y prendas de tela",
  },
  { value: "13999", label: "Fabricación de productos textiles ncp" },
  { value: "14", label: "FABRICACIÓN DE PRENDAS DE VESTIR" },
  {
    value: "14101",
    label: "Fabricación de ropa interior, para dormir y similares",
  },
  { value: "14102", label: "Fabricación de ropa para niños" },
  {
    value: "14103",
    label: "Fabricación de prendas de vestir para ambos sexos",
  },
  { value: "14104", label: "Confección de prendas a medida" },
  { value: "14105", label: "Fabricación de prendas de vestir para deportes" },
  {
    value: "14106",
    label:
      "Elaboración de artesanías de uso personal confeccionadas especialmente de materiales textiles",
  },
  {
    value: "14108",
    label: "Maquilado de prendas de vestir, accesorios y otros",
  },
  {
    value: "14109",
    label: "Fabricación de prendas y accesorios de vestir n.c.p.",
  },
  { value: "14200", label: "Fabricación de artículos de piel" },
  {
    value: "14301",
    label:
      "Fabricación de calcetines, calcetas, medias (panty house) y otros similares",
  },
  { value: "14302", label: "Fabricación de ropa interior de tejido de punto" },
  {
    value: "14309",
    label: "Fabricación de prendas de vestir de tejido de punto ncp",
  },
  { value: "15", label: "FABRICACIÓN DE CUEROS Y PRODUCTOS CONEXOS" },
  {
    value: "15110",
    label: "Curtido y adobo de cueros; adobo y teñido de pieles",
  },
  {
    value: "15121",
    label:
      "Fabricación de maletas, bolsos de mano y otros artículos de marroquinería",
  },
  {
    value: "15122",
    label: "Fabricación de monturas, accesorios y vainas talabartería",
  },
  {
    value: "15123",
    label:
      "Fabricación de artesanías principalmente de cuero natural y sintético",
  },
  {
    value: "15128",
    label:
      "Maquilado de artículos de cuero natural, sintético y de otros materiales",
  },
  { value: "15201", label: "Fabricación de calzado" },
  { value: "15202", label: "Fabricación de partes y accesorios de calzado" },
  { value: "15208", label: "Maquilado de partes y accesorios de calzado" },
  {
    value: "16",
    label:
      "PRODUCCIÓN DE MADERA Y FABRICACIÓN DE PRODUCTOS DE MADERA Y CORCHO EXCEPTO MUEBLES; FABRICACIÓN DE ARTÍCULOS DE PAJA Y DE MATERIALES TRENZABLES",
  },
  { value: "16100", label: "Aserradero y acepilladura de madera" },
  {
    value: "16210",
    label:
      "Fabricación de madera laminada, terciada, enchapada y contrachapada, paneles para la construcción",
  },
  {
    value: "16220",
    label:
      "Fabricación de partes y piezas de carpintería para edificios y construcciones",
  },
  { value: "16230", label: "Fabricación de envases y recipientes de madera" },
  {
    value: "16292",
    label:
      "Fabricación de artesanías de madera, semillas, materiales trenzables",
  },
  {
    value: "16299",
    label:
      "Fabricación de productos de madera, corcho, paja y materiales trenzables ncp",
  },
  { value: "17", label: "FABRICACIÓN DE PAPEL Y DE PRODUCTOS DE PAPEL" },
  { value: "17010", label: "Fabricación de pasta de madera, papel y cartón" },
  {
    value: "17020",
    label: "Fabricación de papel y cartón ondulado y envases de papel y cartón",
  },
  {
    value: "17091",
    label:
      "Fabricación de artículos de papel y cartón de uso personal y doméstico",
  },
  { value: "17092", label: "Fabricación de productos de papel ncp" },
  { value: "18", label: "IMPRESIÓN Y REPRODUCCIÓN DE GRABACIONES" },
  { value: "18110", label: "Impresión" },
  { value: "18120", label: "Servicios relacionados con la impresión" },
  { value: "18200", label: "Reproducción de grabaciones" },
  {
    value: "19",
    label: "FABRICACIÓN DE COQUE Y DE PRODUCTOS DE LA REFINACIÓN DE PETRÓLEO",
  },
  { value: "19100", label: "Fabricación de productos de hornos de coque" },
  { value: "19201", label: "Fabricación de combustible" },
  { value: "19202", label: "Fabricación de aceites y lubricantes" },
  { value: "20", label: "FABRICACIÓN DE SUSTANCIAS Y PRODUCTOS QUÍMICOS" },
  {
    value: "20111",
    label: "Fabricación de materias primas para la fabricación de colorantes",
  },
  { value: "20112", label: "Fabricación de materiales curtientes" },
  { value: "20113", label: "Fabricación de gases industriales" },
  { value: "20114", label: "Fabricación de alcohol etílico" },
  { value: "20119", label: "Fabricación de sustancias químicas básicas" },
  { value: "20120", label: "Fabricación de abonos y fertilizantes" },
  {
    value: "20130",
    label: "Fabricación de plástico y caucho en formas primarias",
  },
  {
    value: "20210",
    label:
      "Fabricación de plaguicidas y otros productos químicos de uso agropecuario",
  },
  {
    value: "20220",
    label:
      "Fabricación de pinturas, barnices y productos de revestimiento similares; tintas de imprenta y masillas",
  },
  {
    value: "20231",
    label: "Fabricación de jabones, detergentes y similares para limpieza",
  },
  {
    value: "20232",
    label:
      "Fabricación de perfumes, cosméticos y productos de higiene y cuidado personal, incluyendo tintes, champú, etc.",
  },
  {
    value: "20291",
    label:
      "Fabricación de tintas y colores para escribir y pintar; fabricación de cintas para impresoras",
  },
  {
    value: "20292",
    label: "Fabricación de productos pirotécnicos, explosivos y municiones",
  },
  { value: "20299", label: "Fabricación de productos químicos n.c.p." },
  { value: "20300", label: "Fabricación de fibras artificiales" },
  {
    value: "21",
    label:
      "FABRICACIÓN DE PRODUCTOS FARMACÉUTICOS, SUSTANCIAS QUÍMICAS MEDICINALES Y PRODUCTOS BOTÁNICOS DE USO FARMACÉUTICO",
  },
  {
    value: "21001",
    label:
      "Manufactura de productos farmacéuticos, sustancias químicas y productos botánicos",
  },
  { value: "21008", label: "Maquilado de medicamentos" },
  { value: "22", label: "FABRICACIÓN DE PRODUCTOS DE CAUCHO Y PLÁSTICO" },
  {
    value: "22110",
    label:
      "Fabricación de cubiertas y cámaras; renovación y recauchutado de cubiertas",
  },
  { value: "22190", label: "Fabricación de otros productos de caucho" },
  { value: "22201", label: "Fabricación de envases plásticos" },
  {
    value: "22202",
    label: "Fabricación de productos plásticos para uso personal o doméstico",
  },
  { value: "22208", label: "Maquila de plásticos" },
  { value: "22209", label: "Fabricación de productos plásticos n.c.p." },
  { value: "23", label: "FABRICACIÓN DE PRODUCTOS MINERALES NO METÁLICOS" },
  { value: "23101", label: "Fabricación de vidrio" },
  { value: "23102", label: "Fabricación de recipientes y envases de vidrio" },
  { value: "23108", label: "Servicio de maquilado" },
  { value: "23109", label: "Fabricación de productos de vidrio ncp" },
  { value: "23910", label: "Fabricación de productos refractarios" },
  {
    value: "23920",
    label: "Fabricación de productos de arcilla para la construcción",
  },
  {
    value: "23931",
    label: "Fabricación de productos de cerámica y porcelana no refractaria",
  },
  {
    value: "23932",
    label: "Fabricación de productos de cerámica y porcelana ncp",
  },
  { value: "23940", label: "Fabricación de cemento, cal y yeso" },
  {
    value: "23950",
    label: "Fabricación de artículos de hormigón, cemento y yeso",
  },
  { value: "23960", label: "Corte, tallado y acabado de la piedra" },
  {
    value: "23990",
    label: "Fabricación de productos minerales no metálicos ncp",
  },
  { value: "24", label: "FABRICACIÓN DE METALES COMUNES" },
  { value: "24100", label: "Industrias básicas de hierro y acero" },
  {
    value: "24200",
    label:
      "Fabricación de productos primarios de metales preciosos y metales no ferrosos",
  },
  { value: "24310", label: "Fundición de hierro y acero" },
  { value: "24320", label: "Fundición de metales no ferrosos" },
  {
    value: "25",
    label:
      "FABRICACIÓN DE PRODUCTOS DERIVADOS DE METAL, EXCEPTO MAQUINARIA Y EQUIPO",
  },
  {
    value: "25111",
    label: "Fabricación de productos metálicos para uso estructural",
  },
  {
    value: "25118",
    label: "Servicio de maquila para la fabricación de estructuras metálicas",
  },
  {
    value: "25120",
    label: "Fabricación de tanques, depósitos y recipientes de metal",
  },
  {
    value: "25130",
    label:
      "Fabricación de generadores de vapor, excepto calderas de agua caliente para calefacción central",
  },
  { value: "25200", label: "Fabricación de armas y municiones" },
  {
    value: "25910",
    label:
      "Forjado, prensado, estampado y laminado de metales; pulvimetalurgia",
  },
  { value: "25920", label: "Tratamiento y revestimiento de metales" },
  {
    value: "25930",
    label:
      "Fabricación de artículos de cuchillería, herramientas de mano y artículos de ferretería",
  },
  {
    value: "25991",
    label: "Fabricación de envases y artículos conexos de metal",
  },
  {
    value: "25992",
    label: "Fabricación de artículos metálicos de uso personal y/o doméstico",
  },
  { value: "25999", label: "Fabricación de productos elaborados de metal ncp" },
  {
    value: "26",
    label: "FABRICACIÓN DE PRODUCTOS DE INFORMÁTICA, ELECTRÓNICA Y ÓPTICA",
  },
  { value: "26100", label: "Fabricación de componentes electrónicos" },
  { value: "26200", label: "Fabricación de computadoras y equipo conexo" },
  { value: "26300", label: "Fabricación de equipo de comunicaciones" },
  {
    value: "26400",
    label:
      "Fabricación de aparatos electrónicos de consumo para audio, video radio y televisión",
  },
  {
    value: "26510",
    label:
      "Fabricación de instrumentos y aparatos para medir, verificar, ensayar, navegar y de control de procesos industriales",
  },
  { value: "26520", label: "Fabricación de relojes y piezas de relojes" },
  {
    value: "26600",
    label:
      "Fabricación de equipo médico de irradiación y equipo electrónico de uso médico y terapéutico",
  },
  {
    value: "26700",
    label: "Fabricación de instrumentos de óptica y equipo fotográfico",
  },
  { value: "26800", label: "Fabricación de medios magnéticos y ópticos" },
  { value: "27", label: "FABRICACIÓN DE EQUIPO ELÉCTRICO" },
  {
    value: "27100",
    label:
      "Fabricación de motores, generadores, transformadores eléctricos, aparatos de distribución y control de electricidad",
  },
  { value: "27200", label: "Fabricación de pilas, baterías y acumuladores" },
  { value: "27310", label: "Fabricación de cables de fibra óptica" },
  { value: "27320", label: "Fabricación de otros hilos y cables eléctricos" },
  { value: "27330", label: "Fabricación de dispositivos de cableados" },
  { value: "27400", label: "Fabricación de equipo eléctrico de iluminación" },
  { value: "27500", label: "Fabricación de aparatos de uso doméstico" },
  { value: "27900", label: "Fabricación de otros tipos de equipo eléctrico" },
  { value: "28", label: "FABRICACIÓN DE MAQUINARIA Y EQUIPO NCP" },
  {
    value: "28110",
    label:
      "Fabricación de motores y turbinas, excepto motores para aeronaves, vehículos automotores y motocicletas",
  },
  { value: "28120", label: "Fabricación de equipo hidráulico" },
  {
    value: "28130",
    label: "Fabricación de otras bombas, compresores, grifos y válvulas",
  },
  {
    value: "28140",
    label:
      "Fabricación de cojinetes, engranajes, trenes de engranajes y piezas de transmisión",
  },
  { value: "28150", label: "Fabricación de hornos y quemadores" },
  {
    value: "28160",
    label: "Fabricación de equipo de elevación y manipulación",
  },
  { value: "28170", label: "Fabricación de maquinaria y equipo de oficina" },
  { value: "28180", label: "Fabricación de herramientas manuales" },
  {
    value: "28190",
    label: "Fabricación de otros tipos de maquinaria de uso general",
  },
  {
    value: "28210",
    label: "Fabricación de maquinaria agropecuaria y forestal",
  },
  {
    value: "28220",
    label:
      "Fabricación de máquinas para conformar metales y maquinaria herramienta",
  },
  { value: "28230", label: "Fabricación de maquinaria metalúrgica" },
  {
    value: "28240",
    label:
      "Fabricación de maquinaria para la explotación de minas y canteras y para obras de construcción",
  },
  {
    value: "28250",
    label:
      "Fabricación de maquinaria para la elaboración de alimentos, bebidas y tabaco",
  },
  {
    value: "28260",
    label:
      "Fabricación de maquinaria para la elaboración de productos textiles, prendas de vestir y cueros",
  },
  { value: "28291", label: "Fabricación de máquinas para imprenta" },
  { value: "28299", label: "Fabricación de maquinaria de uso especial ncp" },
  {
    value: "29",
    label: "FABRICACIÓN DE VEHÍCULOS AUTOMOTORES, REMOLQUES Y SEMIRREMOLQUES",
  },
  { value: "29100", label: "Fabricación vehículos automotores" },
  {
    value: "29200",
    label:
      "Fabricación de carrocerías para vehículos automotores; fabricación de remolques y semiremolques",
  },
  {
    value: "29300",
    label:
      "Fabricación de partes, piezas y accesorios para vehículos automotores",
  },
  { value: "30", label: "FABRICACIÓN DE OTROS TIPOS DE EQUIPO DE TRANSPORTE" },
  { value: "30110", label: "Fabricación de buques" },
  {
    value: "30120",
    label: "Construcción y reparación de embarcaciones de recreo",
  },
  { value: "30200", label: "Fabricación de locomotoras y de material rodante" },
  { value: "30300", label: "Fabricación de aeronaves y naves espaciales" },
  { value: "30400", label: "Fabricación de vehículos militares de combate" },
  { value: "30910", label: "Fabricación de motocicletas" },
  {
    value: "30920",
    label: "Fabricación de bicicletas y sillones de ruedas para inválidos",
  },
  { value: "30990", label: "Fabricación de equipo de transporte ncp" },
  { value: "31", label: "FABRICACIÓN DE MUEBLES" },
  { value: "31001", label: "Fabricación de colchones y somier" },
  {
    value: "31002",
    label: "Fabricación de muebles y otros productos de madera a medida",
  },
  { value: "31008", label: "Servicios de maquilado de muebles" },
  { value: "31009", label: "Fabricación de muebles ncp" },
  { value: "32", label: "OTRAS INDUSTRIAS MANUFACTURERAS" },
  { value: "32110", label: "Fabricación de joyas platerías y joyerías" },
  {
    value: "32120",
    label: "Fabricación de joyas de imitación (fantasía) y artículos conexos",
  },
  { value: "32200", label: "Fabricación de instrumentos musicales" },
  { value: "32301", label: "Fabricación de artículos de deporte" },
  { value: "32308", label: "Servicio de maquila de productos deportivos" },
  { value: "32401", label: "Fabricación de juegos de mesa y de salón" },
  { value: "32402", label: "Servicio de maquilado de juguetes y juegos" },
  { value: "32409", label: "Fabricación de juegos y juguetes n.c.p." },
  {
    value: "32500",
    label: "Fabricación de instrumentos y materiales médicos y odontológicos",
  },
  {
    value: "32901",
    label:
      "Fabricación de lápices, bolígrafos, sellos y artículos de librería en general",
  },
  {
    value: "32902",
    label: "Fabricación de escobas, cepillos, pinceles y similares",
  },
  { value: "32903", label: "Fabricación de artesanías de materiales diversos" },
  {
    value: "32904",
    label: "Fabricación de artículos de uso personal y domésticos n.c.p.",
  },
  {
    value: "32905",
    label:
      "Fabricación de accesorios para las confecciones y la marroquinería n.c.p.",
  },
  { value: "32908", label: "Servicios de maquila ncp" },
  { value: "32909", label: "Fabricación de productos manufacturados n.c.p." },
  { value: "33", label: "REPARACIÓN E INSTALACIÓN DE MAQUINARIA Y EQUIPO" },
  {
    value: "33110",
    label: "Reparación y mantenimiento de productos elaborados de metal",
  },
  { value: "33120", label: "Reparación y mantenimiento de maquinaria" },
  {
    value: "33130",
    label: "Reparación y mantenimiento de equipo electrónico y óptico",
  },
  { value: "33140", label: "Reparación y mantenimiento de equipo eléctrico" },
  {
    value: "33150",
    label:
      "Reparación y mantenimiento de equipo de transporte, excepto vehículos automotores",
  },
  { value: "33190", label: "Reparación y mantenimiento de equipos n.c.p." },
  { value: "33200", label: "Instalación de maquinaria y equipo industrial" },
  {
    value: "D",
    label: "SUMINISTROS DE ELECTRICIDAD, GAS, VAPOR Y AIRE ACONDICIONADO",
  },
  {
    value: "35",
    label: "SUMINISTROS DE ELECTRICIDAD, GAS, VAPOR Y AIRE ACONDICIONADO",
  },
  { value: "35101", label: "Generación de energía eléctrica" },
  { value: "35102", label: "Transmisión de energía eléctrica" },
  { value: "35103", label: "Distribución de energía eléctrica" },
  {
    value: "35200",
    label:
      "Fabricación de gas, distribución de combustibles gaseosos por tuberías",
  },
  { value: "35300", label: "Suministro de vapor y agua caliente" },
  {
    value: "E",
    label:
      "SUMINISTRO DE AGUA, EVACUACIÓN DE AGUAS RESIDUALES (ALCANTARILLADO); GESTIÓN DE DESECHOS Y ACTIVIDADES DE SANEAMIENTO",
  },
  { value: "36", label: "CAPTACIÓN, TRATAMIENTO Y SUMINISTRO DE AGUA" },
  { value: "36000", label: "Captación, tratamiento y suministro de agua" },
  { value: "37", label: "EVACUACIÓN DE AGUAS RESIDUALES (ALCANTARILLADO)" },
  { value: "37000", label: "Evacuación de aguas residuales (alcantarillado)" },
  {
    value: "38",
    label: "RECOLECCIÓN, TRATAMIENTO Y ELIMINACIÓN DE DESECHOS; RECICLAJE",
  },
  {
    value: "38110",
    label:
      "Recolección y transporte de desechos sólidos proveniente de hogares y sector urbano",
  },
  { value: "38120", label: "Recolección de desechos peligrosos" },
  { value: "38210", label: "Tratamiento y eliminación de desechos inicuos" },
  { value: "38220", label: "Tratamiento y eliminación de desechos peligrosos" },
  { value: "38301", label: "Reciclaje de desperdicios y desechos textiles" },
  {
    value: "38302",
    label: "Reciclaje de desperdicios y desechos de plástico y caucho",
  },
  { value: "38303", label: "Reciclaje de desperdicios y desechos de vidrio" },
  {
    value: "38304",
    label: "Reciclaje de desperdicios y desechos de papel y cartón",
  },
  { value: "38305", label: "Reciclaje de desperdicios y desechos metálicos" },
  {
    value: "38309",
    label: "Reciclaje de desperdicios y desechos no metálicos n.c.p.",
  },
  {
    value: "39",
    label:
      "ACTIVIDADES DE SANEAMIENTO Y OTROS SERVICIOS DE GESTIÓN DE DESECHOS",
  },
  {
    value: "39000",
    label:
      "Actividades de Saneamiento y otros Servicios de Gestión de Desechos",
  },
  { value: "F", label: "CONSTRUCCIÓN" },
  { value: "41", label: "CONSTRUCCIÓN DE EDIFICIOS" },
  { value: "41001", label: "Construcción de edificios residenciales" },
  { value: "41002", label: "Construcción de edificios no residenciales" },
  { value: "42", label: "OBRAS DE INGENIERÍA CIVIL" },
  { value: "42100", label: "Construcción de carreteras, calles y caminos" },
  { value: "42200", label: "Construcción de proyectos de servicio público" },
  { value: "42900", label: "Construcción de obras de ingeniería civil n.c.p." },
  { value: "43", label: "ACTIVIDADES ESPECIALIZADAS DE CONSTRUCCIÓN" },
  { value: "43110", label: "Demolición" },
  { value: "43120", label: "Preparación de terreno" },
  { value: "43210", label: "Instalaciones eléctricas" },
  {
    value: "43220",
    label: "Instalación de fontanería, calefacción y aire acondicionado",
  },
  { value: "43290", label: "Otras instalaciones para obras de construcción" },
  { value: "43300", label: "Terminación y acabado de edificios" },
  { value: "43900", label: "Otras actividades especializadas de construcción" },
  { value: "43901", label: "Fabricación de techos y materiales diversos" },
  {
    value: "G",
    label:
      "COMERCIO AL POR MAYOR Y AL POR MENOR; REPARACIÓN DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS",
  },
  {
    value: "45",
    label:
      "COMERCIO AL POR MAYOR Y AL POR MENOR Y REPARACIÓN DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS",
  },
  { value: "45100", label: "Venta de vehículos automotores" },
  { value: "45201", label: "Reparación mecánica de vehículos automotores" },
  {
    value: "45202",
    label: "Reparaciones eléctricas del automotor y recarga de baterías",
  },
  { value: "45203", label: "Enderezado y pintura de vehículos automotores" },
  {
    value: "45204",
    label: "Reparaciones de radiadores, escapes y silenciadores",
  },
  {
    value: "45205",
    label:
      "Reparación y reconstrucción de vías, stop y otros artículos de fibra de vidrio",
  },
  { value: "45206", label: "Reparación de llantas de vehículos automotores" },
  {
    value: "45207",
    label:
      "Polarizado de vehículos (mediante la adhesión de papel especial a los vidrios)",
  },
  { value: "45208", label: "Lavado y pasteado de vehículos (carwash)" },
  { value: "45209", label: "Reparaciones de vehículos n.c.p." },
  { value: "45211", label: "Remolque de vehículos automotores" },
  {
    value: "45301",
    label:
      "Venta de partes, piezas y accesorios nuevos para vehículos automotores",
  },
  {
    value: "45302",
    label:
      "Venta de partes, piezas y accesorios usados para vehículos automotores",
  },
  { value: "45401", label: "Venta de motocicletas" },
  {
    value: "45402",
    label: "Venta de repuestos, piezas y accesorios de motocicletas",
  },
  { value: "45403", label: "Mantenimiento y reparación de motocicletas" },
  {
    value: "46",
    label:
      "COMERCIO AL POR MAYOR, EXCEPTO EL COMERCIO DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS (Parte 1)",
  },
  {
    value: "46100",
    label: "Venta al por mayor a cambio de retribución o por contrata",
  },
  { value: "46201", label: "Venta al por mayor de materias primas agrícolas" },
  {
    value: "46202",
    label: "Venta al por mayor de productos de la silvicultura",
  },
  {
    value: "46203",
    label: "Venta al por mayor de productos pecuarios y de granja",
  },
  { value: "46211", label: "Venta de productos para uso agropecuario" },
  {
    value: "46291",
    label: "Venta al por mayor de granos básicos (cereales, leguminosas)",
  },
  {
    value: "46292",
    label: "Venta al por mayor de semillas mejoradas para cultivo",
  },
  { value: "46293", label: "Venta al por mayor de café oro y uva" },
  { value: "46294", label: "Venta al por mayor de caña de azúcar" },
  {
    value: "46295",
    label: "Venta al por mayor de flores, plantas y otros productos naturales",
  },
  { value: "46296", label: "Venta al por mayor de productos agrícolas" },
  { value: "46297", label: "Venta al por mayor de ganado bovino (vivo)" },
  {
    value: "46298",
    label:
      "Venta al por mayor de animales porcinos, ovinos, caprino, canículas, apícolas, avícolas vivos",
  },
  { value: "46299", label: "Venta de otras especies vivas del reino animal" },
  { value: "46301", label: "Venta al por mayor de alimentos" },
  { value: "46302", label: "Venta al por mayor de bebidas" },
  { value: "46303", label: "Venta al por mayor de tabaco" },
  {
    value: "46371",
    label:
      "Venta al por mayor de frutas, hortalizas (verduras), legumbres y tubérculos",
  },
  {
    value: "46372",
    label:
      "Venta al por mayor de pollos, gallinas destazadas, pavos y otras aves",
  },
  {
    value: "46373",
    label:
      "Venta al por mayor de carne bovina y porcina, productos de carne y embutidos",
  },
  { value: "46374", label: "Venta al por mayor de huevos" },
  { value: "46375", label: "Venta al por mayor de productos lácteos" },
  {
    value: "46376",
    label:
      "Venta al por mayor de productos farináceos de panadería (pan dulce, cakes, respostería, etc.)",
  },
  {
    value: "46377",
    label:
      "Venta al por mayor de pastas alimenticias, aceites y grasas comestibles vegetal y animal",
  },
  { value: "46378", label: "Venta al por mayor de sal comestible" },
  { value: "46379", label: "Venta al por mayor de azúcar" },
  {
    value: "46391",
    label:
      "Venta al por mayor de abarrotes (vinos, licores, productos alimenticios envasados, etc.)",
  },
  { value: "46392", label: "Venta al por mayor de aguas gaseosas" },
  { value: "46393", label: "Venta al por mayor de agua purificada" },
  {
    value: "46394",
    label:
      "Venta al por mayor de refrescos y otras bebidas, líquidas o en polvo",
  },
  { value: "46395", label: "Venta al por mayor de cerveza y licores" },
  { value: "46396", label: "Venta al por mayor de hielo" },
  {
    value: "46411",
    label:
      "Venta al por mayor de hilados, tejidos y productos textiles de mercería",
  },
  {
    value: "46412",
    label:
      "Venta al por mayor de artículos textiles excepto confecciones para el hogar",
  },
  {
    value: "46413",
    label: "Venta al por mayor de confecciones textiles para el hogar",
  },
  {
    value: "46414",
    label: "Venta al por mayor de prendas de vestir y accesorios de vestir",
  },
  { value: "46415", label: "Venta al por mayor de ropa usada" },
  { value: "46416", label: "Venta al por mayor de calzado" },
  {
    value: "46417",
    label: "Venta al por mayor de artículos de marroquinería y talabartería",
  },
  { value: "46418", label: "Venta al por mayor de artículos de peletería" },
  {
    value: "46419",
    label: "Venta al por mayor de otros artículos textiles n.c.p.",
  },
  { value: "46471", label: "Venta al por mayor de instrumentos musicales" },
  {
    value: "46472",
    label: "Venta al por mayor de colchones, almohadas, cojines, etc.",
  },
  {
    value: "46473",
    label:
      "Venta al por mayor de artículos de aluminio para el hogar y para otros usos",
  },
  {
    value: "46474",
    label:
      "Venta al por mayor de depósitos y otros artículos plásticos para el hogar y otros usos, incluyendo los desechables de durapax y no desechables",
  },
  {
    value: "46475",
    label:
      "Venta al por mayor de cámaras fotográficas, accesorios y materiales",
  },
  {
    value: "46482",
    label:
      "Venta al por mayor de medicamentos, artículos y otros productos de uso veterinario",
  },
  {
    value: "46483",
    label:
      "Venta al por mayor de productos y artículos de belleza y de uso personal",
  },
  { value: "46484", label: "Venta de productos farmacéuticos y medicinales" },
  {
    value: "46491",
    label:
      "Venta al por mayor de productos medicinales, cosméticos, perfumería y productos de limpieza",
  },
  {
    value: "46492",
    label: "Venta al por mayor de relojes y artículos de joyería",
  },
  {
    value: "46493",
    label:
      "Venta al por mayor de electrodomésticos y artículos del hogar excepto bazar; artículos de iluminación",
  },
  {
    value: "46494",
    label: "Venta al por mayor de artículos de bazar y similares",
  },
  { value: "46495", label: "Venta al por mayor de artículos de óptica" },
  {
    value: "46496",
    label:
      "Venta al por mayor de revistas, periódicos, libros, artículos de librería y artículos de papel y cartón en general",
  },
  {
    value: "46497",
    label: "Venta de artículos deportivos, juguetes y rodados",
  },
  {
    value: "46498",
    label:
      "Venta al por mayor de productos usados para el hogar o el uso personal",
  },
  {
    value: "46499",
    label: "Venta al por mayor de enseres domésticos y de uso personal n.c.p.",
  },
  {
    value: "46500",
    label: "Venta al por mayor de bicicletas, partes, accesorios y otros",
  },
  {
    value: "46510",
    label:
      "Venta al por mayor de computadoras, equipo periférico y programas informáticos",
  },
  { value: "46520", label: "Venta al por mayor de equipos de comunicación" },
  {
    value: "46530",
    label:
      "Venta al por mayor de maquinaria y equipo agropecuario, accesorios, partes y suministros",
  },
  {
    value: "46590",
    label:
      "Venta de equipos e instrumentos de uso profesional y científico y aparatos de medida y control",
  },
  {
    value: "46591",
    label:
      "Venta al por mayor de maquinaria equipo, accesorios y materiales para la industria de la madera y sus productos",
  },
  {
    value: "46592",
    label:
      "Venta al por mayor de maquinaria, equipo, accesorios y materiales para la industria gráfica y del papel, cartón y productos de papel y cartón",
  },
  {
    value: "46593",
    label:
      "Venta al por mayor de maquinaria, equipo, accesorios y materiales para la industria de productos químicos, plástico y caucho",
  },
  {
    value: "46594",
    label:
      "Venta al por mayor de maquinaria, equipo, accesorios y materiales para la industria metálica y de sus productos",
  },
  {
    value: "46595",
    label:
      "Venta al por mayor de equipamiento para uso médico, odontológico, veterinario y servicios conexos",
  },
  {
    value: "46596",
    label:
      "Venta al por mayor de maquinaria, equipo, accesorios y partes para la industria de la alimentación",
  },
  {
    value: "46597",
    label:
      "Venta al por mayor de maquinaria, equipo, accesorios y partes para la industria textil, confecciones y cuero",
  },
  {
    value: "46598",
    label:
      "Venta al por mayor de maquinaria, equipo y accesorios para la construcción y explotación de minas y canteras",
  },
  {
    value: "46599",
    label:
      "Venta al por mayor de otro tipo de maquinaria y equipo con sus accesorios y partes",
  },
  {
    value: "46610",
    label:
      "Venta al por mayor de otros combustibles sólidos, líquidos, gaseosos y de productos conexos",
  },
  {
    value: "46612",
    label:
      "Venta al por mayor de combustibles para automotores, aviones, barcos, maquinaria y otros",
  },
  {
    value: "46613",
    label:
      "Venta al por mayor de lubricantes, grasas y otros aceites para automotores, maquinaria industrial, etc.",
  },
  { value: "46614", label: "Venta al por mayor de gas propano" },
  { value: "46615", label: "Venta al por mayor de leña y carbón" },
  {
    value: "46620",
    label: "Venta al por mayor de metales y minerales metalíferos",
  },
  {
    value: "46631",
    label: "Venta al por mayor de puertas, ventanas, vitrinas y similares",
  },
  {
    value: "46632",
    label: "Venta al por mayor de artículos de ferretería y pinturerías",
  },
  { value: "46633", label: "Vidrierías" },
  { value: "46634", label: "Venta al por mayor de maderas" },
  {
    value: "46639",
    label: "Venta al por mayor de materiales para la construcción n.c.p.",
  },
  { value: "46691", label: "Venta al por mayor de sal industrial sin yodar" },
  {
    value: "46692",
    label:
      "Venta al por mayor de productos intermedios y desechos de origen textil",
  },
  {
    value: "46693",
    label:
      "Venta al por mayor de productos intermedios y desechos de origen metálico",
  },
  {
    value: "46694",
    label:
      "Venta al por mayor de productos intermedios y desechos de papel y cartón",
  },
  {
    value: "46695",
    label:
      "Venta al por mayor fertilizantes, abonos, agroquímicos y productos similares",
  },
  {
    value: "46696",
    label:
      "Venta al por mayor de productos intermedios y desechos de origen plástico",
  },
  {
    value: "46697",
    label:
      "Venta al por mayor de tintas para imprenta, productos curtientes y materias y productos colorantes",
  },
  {
    value: "46698",
    label:
      "Venta de productos intermedios y desechos de origen químico y de caucho",
  },
  {
    value: "46699",
    label: "Venta al por mayor de productos intermedios y desechos ncp",
  },
  { value: "46701", label: "Venta de algodón en oro" },
  { value: "46900", label: "Venta al por mayor de otros productos" },
  {
    value: "46901",
    label: "Venta al por mayor de cohetes y otros productos pirotécnicos",
  },
  {
    value: "46902",
    label: "Venta al por mayor de artículos diversos para consumo humano",
  },
  {
    value: "46903",
    label: "Venta al por mayor de armas de fuego, municiones y accesorios",
  },
  {
    value: "46904",
    label:
      "Venta al por mayor de toldos y tiendas de campaña de cualquier material",
  },
  {
    value: "46905",
    label: "Venta al por mayor de exhibidores publicitarios y rótulos",
  },
  {
    value: "46906",
    label: "Venta al por mayor de artículos promocionales diversos",
  },
  {
    value: "47",
    label:
      "COMERCIO AL POR MENOR, EXCEPTO DE VEHÍCULOS AUTOMOTORES Y MOTOCICLETAS",
  },
  { value: "47111", label: "Venta en supermercados" },
  {
    value: "47112",
    label: "Venta en tiendas de artículos de primera necesidad",
  },
  { value: "47119", label: "Almacenes (venta de diversos artículos)" },
  {
    value: "47120",
    label:
      "Almacenes (venta de diversos artículos), y venta de vehículos automotores y motocicletas",
  },
  {
    value: "47190",
    label:
      "Venta al por menor de otros productos en comercios no especializados",
  },
  {
    value: "47199",
    label:
      "Venta de establecimientos no especializados con surtido compuesto principalmente de alimentos, bebidas y tabaco",
  },
  { value: "47211", label: "Venta al por menor de frutas y hortalizas" },
  {
    value: "47212",
    label: "Venta al por menor de carnes, embutidos y productos de granja",
  },
  { value: "47213", label: "Venta al por menor de pescado y mariscos" },
  { value: "47214", label: "Venta al por menor de productos lácteos" },
  {
    value: "47215",
    label:
      "Venta al por menor de productos de panadería, repostería y galletas",
  },
  { value: "47216", label: "Venta al por menor de huevos" },
  {
    value: "47217",
    label: "Venta al por menor de carnes y productos cárnicos",
  },
  { value: "47218", label: "Venta al por menor de granos básicos y otros" },
  { value: "47219", label: "Venta al por menor de alimentos n.c.p." },
  { value: "47221", label: "Venta al por menor de hielo" },
  {
    value: "47223",
    label:
      "Venta de bebidas no alcohólicas, para su consumo fuera del establecimiento",
  },
  {
    value: "47224",
    label:
      "Venta de bebidas alcohólicas, para su consumo fuera del establecimiento",
  },
  {
    value: "47225",
    label:
      "Venta de bebidas alcohólicas para su consumo dentro del establecimiento",
  },
  { value: "47230", label: "Venta al por menor de tabaco" },
  {
    value: "47300",
    label: "Venta de combustibles, lubricantes y otros (gasolineras)",
  },
  {
    value: "47411",
    label: "Venta al por menor de computadoras y equipo periférico",
  },
  { value: "47412", label: "Venta de equipo y accesorios de telecomunicación" },
  { value: "47420", label: "Venta al por menor de equipo de audio y video" },
  {
    value: "47510",
    label:
      "Venta al por menor de hilados, tejidos y productos textiles de mercería; confecciones para el hogar y textiles n.c.p.",
  },
  { value: "47521", label: "Venta al por menor de productos de madera" },
  { value: "47522", label: "Venta al por menor de artículos de ferretería" },
  { value: "47523", label: "Venta al por menor de productos de pinturerías" },
  { value: "47524", label: "Venta al por menor en vidrierías" },
  {
    value: "47529",
    label:
      "Venta al por menor de materiales de construcción y artículos conexos",
  },
  {
    value: "47530",
    label:
      "Venta al por menor de tapices, alfombras y revestimientos de paredes y pisos en comercios especializados",
  },
  { value: "47591", label: "Venta al por menor de muebles" },
  { value: "47592", label: "Venta al por menor de artículos de bazar" },
  {
    value: "47593",
    label:
      "Venta al por menor de aparatos electrodomésticos, repuestos y accesorios",
  },
  {
    value: "47594",
    label: "Venta al por menor de artículos eléctricos y de iluminación",
  },
  { value: "47598", label: "Venta al por menor de instrumentos musicales" },
  {
    value: "47610",
    label:
      "Venta al por menor de libros, periódicos y artículos de papelería en comercios especializados",
  },
  {
    value: "47620",
    label:
      "Venta al por menor de discos láser, cassettes, cintas de video y otros",
  },
  {
    value: "47630",
    label: "Venta al por menor de productos y equipos de deporte",
  },
  {
    value: "47631",
    label: "Venta al por menor de bicicletas, accesorios y repuestos",
  },
  {
    value: "47640",
    label:
      "Venta al por menor de juegos y juguetes en comercios especializados",
  },
  {
    value: "47711",
    label: "Venta al por menor de prendas de vestir y accesorios de vestir",
  },
  { value: "47712", label: "Venta al por menor de calzado" },
  {
    value: "47713",
    label:
      "Venta al por menor de artículos de peletería, marroquinería y talabartería",
  },
  {
    value: "47721",
    label:
      "Venta al por menor de medicamentos farmacéuticos y otros materiales y artículos de uso médico, odontológico y veterinario",
  },
  {
    value: "47722",
    label: "Venta al por menor de productos cosméticos y de tocador",
  },
  {
    value: "47731",
    label:
      "Venta al por menor de productos de joyería, bisutería, óptica, relojería",
  },
  {
    value: "47732",
    label:
      "Venta al por menor de plantas, semillas, animales y artículos conexos",
  },
  {
    value: "47733",
    label:
      "Venta al por menor de combustibles de uso doméstico (gas propano y gas licuado)",
  },
  {
    value: "47734",
    label:
      "Venta al por menor de artesanías, artículos cerámicos y recuerdos en general",
  },
  {
    value: "47735",
    label:
      "Venta al por menor de ataúdes, lápidas y cruces, trofeos, artículos religiosos en general",
  },
  {
    value: "47736",
    label: "Venta al por menor de armas de fuego, municiones y accesorios",
  },
  {
    value: "47737",
    label: "Venta al por menor de artículos de cohetería y pirotécnicos",
  },
  {
    value: "47738",
    label:
      "Venta al por menor de artículos desechables de uso personal y doméstico (servilletas, papel higiénico, pañales, toallas sanitarias, etc.)",
  },
  { value: "47739", label: "Venta al por menor de otros productos n.c.p." },
  { value: "47741", label: "Venta al por menor de artículos usados" },
  {
    value: "47742",
    label: "Venta al por menor de textiles y confecciones usados",
  },
  {
    value: "47743",
    label: "Venta al por menor de libros, revistas, papel y cartón usados",
  },
  { value: "47749", label: "Venta al por menor de productos usados n.c.p." },
  {
    value: "47811",
    label: "Venta al por menor de frutas, verduras y hortalizas",
  },
  { value: "47814", label: "Venta al por menor de productos lácteos" },
  {
    value: "47815",
    label: "Venta al por menor de productos de panadería, galletas y similares",
  },
  { value: "47816", label: "Venta al por menor de bebidas" },
  {
    value: "47818",
    label: "Venta al por menor en tiendas de mercado y puestos",
  },
  {
    value: "47821",
    label:
      "Venta al por menor de hilados, tejidos y productos textiles de mercería en puestos de mercados y ferias",
  },
  {
    value: "47822",
    label:
      "Venta al por menor de artículos textiles excepto confecciones para el hogar en puestos de mercados y ferias",
  },
  {
    value: "47823",
    label:
      "Venta al por menor de confecciones textiles para el hogar en puestos de mercados y ferias",
  },
  {
    value: "47824",
    label:
      "Venta al por menor de prendas de vestir, accesorios de vestir y similares en puestos de mercados y ferias",
  },
  { value: "47825", label: "Venta al por menor de ropa usada" },
  {
    value: "47826",
    label:
      "Venta al por menor de calzado, artículos de marroquinería y talabartería en puestos de mercados y ferias",
  },
  {
    value: "47827",
    label:
      "Venta al por menor de artículos de marroquinería y talabartería en puestos de mercados y ferias",
  },
  {
    value: "47829",
    label:
      "Venta al por menor de artículos textiles ncp en puestos de mercados y ferias",
  },
  {
    value: "47891",
    label:
      "Venta al por menor de animales, flores y productos conexos en puestos de feria y mercados",
  },
  {
    value: "47892",
    label:
      "Venta al por menor de productos medicinales, cosméticos, de tocador y de limpieza en puestos de ferias y mercados",
  },
  {
    value: "47893",
    label:
      "Venta al por menor de artículos de bazar en puestos de ferias y mercados",
  },
  {
    value: "47894",
    label:
      "Venta al por menor de artículos de papel, envases, libros, revistas y conexos en puestos de feria y mercados",
  },
  {
    value: "47895",
    label:
      "Venta al por menor de materiales de construcción, electrodomésticos, accesorios para autos y similares en puestos de feria y mercados",
  },
  {
    value: "47896",
    label:
      "Venta al por menor de equipos accesorios para las comunicaciones en puestos de feria y mercados",
  },
  {
    value: "47899",
    label: "Venta al por menor en puestos de ferias y mercados n.c.p.",
  },
  { value: "47910", label: "Venta al por menor por correo o Internet" },
  {
    value: "47990",
    label:
      "Otros tipos de venta al por menor no realizada, en almacenes, puestos de venta o mercado",
  },
  { value: "H", label: "TRANSPORTE Y ALMACENAMIENTO" },
  {
    value: "49",
    label: "TRANSPORTE POR VÍA TERRESTRE Y TRANSPORTE POR TUBERÍAS",
  },
  {
    value: "49110",
    label: "Transporte interurbano de pasajeros por ferrocarril",
  },
  { value: "49120", label: "Transporte de carga por ferrocarril" },
  {
    value: "49211",
    label: "Transporte de pasajeros urbanos e interurbano mediante buses",
  },
  {
    value: "49212",
    label: "Transporte de pasajeros interdepartamental mediante microbuses",
  },
  {
    value: "49213",
    label: "Transporte de pasajeros urbanos e interurbano mediante microbuses",
  },
  {
    value: "49214",
    label: "Transporte de pasajeros interdepartamental mediante buses",
  },
  { value: "49221", label: "Transporte internacional de pasajeros" },
  {
    value: "49222",
    label: "Transporte de pasajeros mediante taxis y autos con chofer",
  },
  { value: "49223", label: "Transporte escolar" },
  { value: "49225", label: "Transporte de pasajeros para excursiones" },
  { value: "49226", label: "Servicios de transporte de personal" },
  { value: "49229", label: "Transporte de pasajeros por vía terrestre ncp" },
  { value: "49231", label: "Transporte de carga urbano" },
  { value: "49232", label: "Transporte nacional de carga" },
  { value: "49233", label: "Transporte de carga internacional" },
  { value: "49234", label: "Servicios de mudanza" },
  { value: "49235", label: "Alquiler de vehículos de carga con conductor" },
  { value: "49300", label: "Transporte por oleoducto o gasoducto" },
  { value: "50", label: "TRANSPORTE POR VÍA ACUÁTICA" },
  { value: "50110", label: "Transporte de pasajeros marítimo y de cabotaje" },
  { value: "50120", label: "Transporte de carga marítimo y de cabotaje" },
  {
    value: "50211",
    label: "Transporte de pasajeros por vías de navegación interiores",
  },
  {
    value: "50212",
    label:
      "Alquiler de equipo de transporte de pasajeros por vías de navegación interior con conductor",
  },
  {
    value: "50220",
    label: "Transporte de carga por vías de navegación interiores",
  },
  { value: "51", label: "TRANSPORTE POR VÍA AÉREA" },
  { value: "51100", label: "Transporte aéreo de pasajeros" },
  { value: "51201", label: "Transporte de carga por vía aérea" },
  {
    value: "51202",
    label:
      "Alquiler de equipo de aerotransporte con operadores para el propósito de transportar carga",
  },
  { value: "52", label: "ALMACENAMIENTO Y ACTIVIDADES DE APOYO AL TRANSPORTE" },
  {
    value: "52101",
    label: "Alquiler de instalaciones de almacenamiento en zonas francas",
  },
  {
    value: "52102",
    label: "Alquiler de silos para conservación y almacenamiento de granos",
  },
  {
    value: "52103",
    label:
      "Alquiler de instalaciones con refrigeración para almacenamiento y conservación de alimentos y otros productos",
  },
  {
    value: "52109",
    label: "Alquiler de bodegas para almacenamiento y depósito n.c.p.",
  },
  { value: "52211", label: "Servicio de garaje y estacionamiento" },
  {
    value: "52212",
    label: "Servicios de terminales para el transporte por vía terrestre",
  },
  {
    value: "52219",
    label: "Servicios para el transporte por vía terrestre n.c.p.",
  },
  { value: "52220", label: "Servicios para el transporte acuático" },
  { value: "52230", label: "Servicios para el transporte aéreo" },
  { value: "52240", label: "Manipulación de carga" },
  { value: "52290", label: "Servicios para el transporte ncp" },
  { value: "52291", label: "Agencias de tramitaciones aduanales" },
  { value: "53", label: "ACTIVIDADES POSTALES Y DE MENSAJERÍA" },
  { value: "53100", label: "Servicios de correo nacional" },
  {
    value: "53200",
    label:
      "Actividades de correo distintas a las actividades postales nacionales",
  },
  { value: "53201", label: "Agencia privada de correo y encomiendas" },
  { value: "I", label: "ACTIVIDADES DE ALOJAMIENTO Y DE SERVICIO DE COMIDAS" },
  { value: "55", label: "ACTIVIDADES DE ALOJAMIENTO" },
  { value: "55101", label: "Actividades de alojamiento para estancias cortas" },
  { value: "55102", label: "Hoteles" },
  {
    value: "55200",
    label:
      "Actividades de campamentos, parques de vehículos de recreo y parques de caravanas",
  },
  { value: "55900", label: "Alojamiento n.c.p." },
  { value: "56", label: "ACTIVIDADES DE SERVICIO DE COMIDAS Y BEBIDAS" },
  { value: "56101", label: "Restaurantes" },
  { value: "56106", label: "Pupusería" },
  { value: "56107", label: "Actividades varias de restaurantes" },
  { value: "56108", label: "Comedores" },
  { value: "56109", label: "Merenderos ambulantes" },
  { value: "56210", label: "Preparación de comida para eventos especiales" },
  { value: "56291", label: "Servicios de provisión de comidas por contrato" },
  {
    value: "56292",
    label:
      "Servicios de concesión de cafetines y chalet en empresas e instituciones",
  },
  { value: "56299", label: "Servicios de preparación de comidas ncp" },
  {
    value: "56301",
    label: "Servicio de expendio de bebidas en salones y bares",
  },
  {
    value: "56302",
    label:
      "Servicio de expendio de bebidas en puestos callejeros, mercados y ferias",
  },
  { value: "J", label: "INFORMACIÓN Y COMUNICACIONES" },
  { value: "58", label: "ACTIVIDADES DE EDICIÓN" },
  {
    value: "58110",
    label:
      "Edición de libros, folletos, partituras y otras ediciones distintas a estas",
  },
  { value: "58120", label: "Edición de directorios y listas de correos" },
  {
    value: "58130",
    label: "Edición de periódicos, revistas y otras publicaciones periódicas",
  },
  { value: "58190", label: "Otras actividades de edición" },
  { value: "58200", label: "Edición de programas informáticos (software)" },
  {
    value: "59",
    label:
      "ACTIVIDADES DE PRODUCCIÓN DE PELÍCULAS CINEMATOGRÁFICAS, VIDEOS Y PROGRAMAS DE TELEVISIÓN, GRABACIÓN DE SONIDO Y EDICIÓN DE MÚSICA",
  },
  { value: "59110", label: "Actividades de producción cinematográfica" },
  {
    value: "59120",
    label:
      "Actividades de post producción de películas, videos y programas de televisión",
  },
  {
    value: "59130",
    label:
      "Actividades de distribución de películas cinematográficas, videos y programas de televisión",
  },
  {
    value: "59140",
    label:
      "Actividades de exhibición de películas cinematográficas y cintas de vídeo",
  },
  { value: "59200", label: "Actividades de edición y grabación de música" },
  { value: "60", label: "ACTIVIDADES DE PROGRAMACIÓN Y TRANSMISIÓN" },
  { value: "60100", label: "Servicios de difusiones de radio" },
  {
    value: "60201",
    label: "Actividades de programación y difusión de televisión abierta",
  },
  {
    value: "60202",
    label:
      "Actividades de suscripción y difusión de televisión por cable y/o suscripción",
  },
  {
    value: "60299",
    label: "Servicios de televisión, incluye televisión por cable",
  },
  { value: "60900", label: "Programación y transmisión de radio y televisión" },
  { value: "61", label: "TELECOMUNICACIONES" },
  { value: "61101", label: "Servicio de telefonía" },
  { value: "61102", label: "Servicio de Internet" },
  { value: "61103", label: "Servicio de telefonía fija" },
  { value: "61109", label: "Servicio de Internet n.c.p." },
  { value: "61201", label: "Servicios de telefonía celular" },
  { value: "61202", label: "Servicios de Internet inalámbrico" },
  {
    value: "61209",
    label: "Servicios de telecomunicaciones inalámbrico n.c.p.",
  },
  { value: "61301", label: "Telecomunicaciones satelitales" },
  { value: "61309", label: "Comunicación vía satélite n.c.p." },
  { value: "61900", label: "Actividades de telecomunicación n.c.p." },
  {
    value: "62",
    label:
      "PROGRAMACIÓN INFORMÁTICA, CONSULTORÍA INFORMÁTICA Y ACTIVIDADES CONEXAS",
  },
  { value: "62010", label: "Programación Informática" },
  { value: "62020", label: "Consultorías y gestión de servicios informáticos" },
  {
    value: "62090",
    label:
      "Otras actividades de tecnología de información y servicios de computadora",
  },
  { value: "63", label: "ACTIVIDADES DE SERVICIOS DE INFORMACIÓN" },
  {
    value: "63110",
    label: "Procesamiento de datos y Actividades relacionadas",
  },
  { value: "63120", label: "Portales WEB" },
  { value: "63910", label: "Servicios de Agencias de Noticias" },
  { value: "63990", label: "Otros servicios de información n.c.p." },
  { value: "K", label: "ACTIVIDADES FINANCIERAS Y DE SEGUROS" },
  {
    value: "64",
    label:
      "ACTIVIDADES DE SERVICIOS FINANCIEROS EXCEPTO LAS DE SEGUROS Y FONDOS DE PENSIONES",
  },
  {
    value: "64110",
    label: "Servicios provistos por el Banco Central de El salvador",
  },
  { value: "64190", label: "Bancos" },
  { value: "64192", label: "Entidades dedicadas al envío de remesas" },
  { value: "64199", label: "Otras entidades financieras" },
  { value: "64200", label: "Actividades de sociedades de cartera" },
  {
    value: "64300",
    label: "Fideicomisos, fondos y otras fuentes de financiamiento",
  },
  { value: "64910", label: "Arrendamientos financieros" },
  {
    value: "64920",
    label:
      "Asociaciones cooperativas de ahorro y crédito dedicadas a la intermediación financiera",
  },
  {
    value: "64921",
    label: "Instituciones emisoras de tarjetas de crédito y otros",
  },
  { value: "64922", label: "Tipos de crédito ncp" },
  { value: "64928", label: "Prestamistas y casas de empeño" },
  {
    value: "64990",
    label:
      "Actividades de servicios financieros, excepto la financiación de planes de seguros y de pensiones n.c.p.",
  },
  {
    value: "65",
    label:
      "SEGUROS, REASEGUROS Y FONDOS DE PENSIONES, EXCEPTO PLANES DE SEGURIDAD SOCIAL DE AFILIACIÓN OBLIGATORIA.",
  },
  { value: "65110", label: "Planes de seguros de vida" },
  { value: "65120", label: "Planes de seguro excepto de vida" },
  { value: "65199", label: "Seguros generales de todo tipo" },
  { value: "65200", label: "Planes se seguro" },
  { value: "65300", label: "Planes de pensiones" },
  {
    value: "66",
    label: "ACTIVIDADES AUXILIARES DE LAS ACTIVIDADES DE SERVICIOS FINANCIEROS",
  },
  {
    value: "66110",
    label: "Administración de mercados financieros (Bolsa de Valores)",
  },
  { value: "66120", label: "Actividades bursátiles (Corredores de Bolsa)" },
  {
    value: "66190",
    label: "Actividades auxiliares de la intermediación financiera ncp",
  },
  { value: "66210", label: "Evaluación de riesgos y daños" },
  { value: "66220", label: "Actividades de agentes y corredores de seguros" },
  {
    value: "66290",
    label: "Otras actividades auxiliares de seguros y fondos de pensiones",
  },
  { value: "66300", label: "Actividades de administración de fondos" },
  { value: "L", label: "ACTIVIDADES INMOBILIARIAS" },
  { value: "68", label: "ACTIVIDADES INMOBILIARIAS" },
  {
    value: "68101",
    label: "Servicio de alquiler y venta de lotes en cementerios",
  },
  {
    value: "68109",
    label:
      "Actividades inmobiliarias realizadas con bienes propios o arrendados n.c.p.",
  },
  {
    value: "68200",
    label:
      "Actividades Inmobiliarias Realizadas a Cambio de una Retribución o por Contrata",
  },
  { value: "M", label: "ACTIVIDADES PROFESIONALES, CIENTÍFICAS Y TÉCNICAS" },
  { value: "69", label: "ACTIVIDADES JURÍDICAS Y CONTABLES" },
  { value: "69100", label: "Actividades jurídicas" },
  {
    value: "69200",
    label:
      "Actividades de contabilidad, teneduría de libros y auditoría; asesoramiento en materia de impuestos",
  },
  {
    value: "70",
    label:
      "ACTIVIDADES DE OFICINAS CENTRALES; ACTIVIDADES DE CONSULTORIA EN GESTIÓN EMPRESARIAL",
  },
  {
    value: "70100",
    label: "Actividades de oficinas centrales de sociedades de cartera",
  },
  {
    value: "70200",
    label: "Actividades de consultoría en gestión empresarial",
  },
  {
    value: "71",
    label:
      "ACTIVIDADES DE ARQUITECTURA E INGENIERÍA; ENSAYOS Y ANÁLISIS TÉCNICOS",
  },
  {
    value: "71101",
    label:
      "Servicios de arquitectura y planificación urbana y servicios conexos",
  },
  { value: "71102", label: "Servicios de ingeniería" },
  {
    value: "71103",
    label:
      "Servicios de agrimensura, topografía, cartografía, prospección y geofísica y servicios conexos",
  },
  { value: "71200", label: "Ensayos y análisis técnicos" },
  { value: "72", label: "INVESTIGACIÓN CIENTÍFICA Y DESARROLLO" },
  {
    value: "72100",
    label:
      "Investigaciones y desarrollo experimental en el campo de las ciencias naturales y la ingeniería",
  },
  { value: "72199", label: "Investigaciones científicas" },
  {
    value: "72200",
    label:
      "Investigaciones y desarrollo experimental en el campo de las ciencias sociales y las humanidades científica y desarrollo",
  },
  { value: "73", label: "PUBLICIDAD Y ESTUDIOS DE MERCADO" },
  { value: "73100", label: "Publicidad" },
  {
    value: "73200",
    label:
      "Investigación de mercados y realización de encuestas de opinión pública",
  },
  {
    value: "74",
    label: "OTRAS ACTIVIDADES PROFESIONALES, CIENTÍFICAS Y TÉCNICAS",
  },
  { value: "74100", label: "Actividades de diseño especializado" },
  { value: "74200", label: "Actividades de fotografía" },
  { value: "74900", label: "Servicios profesionales y científicos ncp" },
  { value: "75", label: "ACTIVIDADES VETERINARIAS" },
  { value: "75000", label: "Actividades veterinarias" },
  { value: "N", label: "ACTIVIDADES DE SERVICIOS ADMINISTRATIVOS Y DE APOYO" },
  { value: "77", label: "ACTIVIDADES DE ALQUILER Y ARRENDAMIENTO" },
  { value: "77101", label: "Alquiler de equipo de transporte terrestre" },
  { value: "77102", label: "Alquiler de equipo de transporte acuático" },
  { value: "77103", label: "Alquiler de equipo de transporte por vía aérea" },
  {
    value: "77210",
    label: "Alquiler y arrendamiento de equipo de recreo y deportivo",
  },
  { value: "77220", label: "Alquiler de cintas de video y discos" },
  {
    value: "77290",
    label: "Alquiler de otros efectos personales y enseres domésticos",
  },
  { value: "77300", label: "Alquiler de maquinaria y equipo" },
  {
    value: "77400",
    label: "Arrendamiento de productos de propiedad intelectual",
  },
  { value: "78", label: "ACTIVIDADES DE EMPLEO" },
  { value: "78100", label: "Obtención y dotación de personal" },
  { value: "78200", label: "Actividades de las agencias de trabajo temporal" },
  {
    value: "78300",
    label:
      "Dotación de recursos humanos y gestión; gestión de las funciones de recursos humanos",
  },
  {
    value: "79",
    label:
      "ACTIVIDADES DE AGENCIAS DE VIAJES, OPERADORES TURÍSTICOS Y OTROS SERVICIOS DE RESERVA Y ACTIVIDADES CONEXAS",
  },
  {
    value: "79110",
    label:
      "Actividades de agencias de viajes y organizadores de viajes; actividades de asistencia a turistas",
  },
  { value: "79120", label: "Actividades de los operadores turísticos" },
  {
    value: "79900",
    label: "Otros servicios de reservas y actividades relacionadas",
  },
  { value: "80", label: "ACTIVIDADES DE INVESTIGACIÓN Y SEGURIDAD" },
  { value: "80100", label: "Servicios de seguridad privados" },
  {
    value: "80201",
    label: "Actividades de servicios de sistemas de seguridad",
  },
  {
    value: "80202",
    label: "Actividades para la prestación de sistemas de seguridad",
  },
  { value: "80300", label: "Actividades de investigación" },
  { value: "81", label: "ACTIVIDADES DE SERVICIOS A EDIFICIOS Y PAISAJISMO" },
  {
    value: "81100",
    label:
      "Actividades combinadas de mantenimiento de edificios e instalaciones",
  },
  { value: "81210", label: "Limpieza general de edificios" },
  {
    value: "81290",
    label:
      "Otras actividades combinadas de mantenimiento de edificios e instalaciones ncp",
  },
  { value: "81300", label: "Servicio de jardinería" },
  {
    value: "82",
    label:
      "ACTIVIDADES ADMINISTRATIVAS Y DE APOYO DE OFICINAS Y OTRAS ACTIVIDADES DE APOYO A LAS EMPRESAS",
  },
  { value: "82110", label: "Servicios administrativos de oficinas" },
  {
    value: "82190",
    label: "Servicio de fotocopiado y similares, excepto en imprentas",
  },
  {
    value: "82200",
    label: "Actividades de las centrales de llamadas (call center)",
  },
  {
    value: "82300",
    label: "Organización de convenciones y ferias de negocios",
  },
  {
    value: "82910",
    label: "Actividades de agencias de cobro y oficinas de crédito",
  },
  {
    value: "82921",
    label: "Servicios de envase y empaque de productos alimenticios",
  },
  {
    value: "82922",
    label: "Servicios de envase y empaque de productos medicinales",
  },
  { value: "82929", label: "Servicio de envase y empaque ncp" },
  { value: "82990", label: "Actividades de apoyo empresariales ncp" },
  {
    value: "O",
    label:
      "ADMINISTRACIÓN PÚBLICA Y DEFENSA; PLANES DE SEGURIDAD SOCIAL DE AFILIACIÓN OBLIGATORIA",
  },
  {
    value: "84",
    label:
      "ADMINISTRACIÓN PÚBLICA Y DEFENSA; PLANES DE SEGURIDAD SOCIAL DE AFILIACIÓN OBLIGATORIA",
  },
  {
    value: "84110",
    label: "Actividades de la Administración Pública en general",
  },
  { value: "84111", label: "Alcaldías Municipales" },
  {
    value: "84120",
    label:
      "Regulación de las actividades de prestación de servicios sanitarios, educativos, culturales y otros servicios sociales, excepto seguridad social",
  },
  {
    value: "84130",
    label: "Regulación y facilitación de la actividad económica",
  },
  {
    value: "84210",
    label:
      "Actividades de administración y funcionamiento del Ministerio de Relaciones Exteriores",
  },
  { value: "84220", label: "Actividades de defensa" },
  {
    value: "84230",
    label: "Actividades de mantenimiento del orden público y de seguridad",
  },
  {
    value: "84300",
    label:
      "Actividades de planes de seguridad social de afiliación obligatoria",
  },
  { value: "P", label: "ENSEÑANZA" },
  { value: "85", label: "ENSEÑANZA" },
  { value: "85101", label: "Guardería educativa" },
  { value: "85102", label: "Enseñanza preescolar o parvularia" },
  { value: "85103", label: "Enseñanza primaria" },
  {
    value: "85104",
    label: "Servicio de educación preescolar y primaria integrada",
  },
  { value: "85211", label: "Enseñanza secundaria tercer ciclo (7°, 8° y 9°)" },
  {
    value: "85212",
    label: "Enseñanza secundaria de formación general bachillerato",
  },
  {
    value: "85221",
    label: "Enseñanza secundaria de formación técnica y profesional",
  },
  {
    value: "85222",
    label:
      "Enseñanza secundaria de formación técnica y profesional integrada con enseñanza primaria",
  },
  { value: "85301", label: "Enseñanza superior universitaria" },
  { value: "85302", label: "Enseñanza superior no universitaria" },
  {
    value: "85303",
    label: "Enseñanza superior integrada a educación secundaria y/o primaria",
  },
  { value: "85410", label: "Educación deportiva y recreativa" },
  { value: "85420", label: "Educación cultural" },
  { value: "85490", label: "Otros tipos de enseñanza n.c.p." },
  { value: "85499", label: "Enseñanza formal" },
  { value: "85500", label: "Servicios de apoyo a la enseñanza" },
  {
    value: "Q",
    label: "ACTIVIDADES DE ATENCIÓN A LA SALUD HUMANA Y DE ASISTENCIA SOCIAL",
  },
  { value: "86", label: "ACTIVIDADES DE ATENCIÓN DE LA SALUD HUMANA" },
  { value: "86100", label: "Actividades de hospitales" },
  { value: "86201", label: "Clínicas médicas" },
  { value: "86202", label: "Servicios de Odontología" },
  { value: "86203", label: "Servicios médicos" },
  { value: "86901", label: "Servicios de análisis y estudios de diagnóstico" },
  { value: "86902", label: "Actividades de atención de la salud humana" },
  { value: "86909", label: "Otros Servicio relacionados con la salud ncp" },
  {
    value: "87",
    label: "ACTIVIDADES DE ATENCIÓN DE ENFERMERÍA EN INSTITUCIONES",
  },
  {
    value: "87100",
    label: "Residencias de ancianos con atención de enfermería",
  },
  {
    value: "87200",
    label:
      "Instituciones dedicadas al tratamiento del retraso mental, problemas de salud mental y el uso indebido de sustancias nocivas",
  },
  {
    value: "87300",
    label: "Instituciones dedicadas al cuidado de ancianos y discapacitados",
  },
  { value: "87900", label: "Actividades de asistencia a niños y jóvenes" },
  { value: "87901", label: "Otras actividades de atención en instituciones" },
  { value: "88", label: "ACTIVIDADES DE ASISTENCIA SOCIAL SIN ALOJAMIENTO" },
  {
    value: "88100",
    label:
      "Actividades de asistencia sociales sin alojamiento para ancianos y discapacitados",
  },
  { value: "88900", label: "servicios sociales sin alojamiento ncp" },
  {
    value: "R",
    label: "ACTIVIDADES ARTÍSTICAS, DE ENTRETENIMIENTO Y RECREATIVAS",
  },
  { value: "90", label: "ACTIVIDADES CREATIVAS ARTÍSTICAS Y DE ESPARCIMIENTO" },
  {
    value: "90000",
    label: "Actividades creativas artísticas y de esparcimiento",
  },
  {
    value: "91",
    label:
      "ACTIVIDADES BIBLIOTECAS, ARCHIVOS, MUSEOS Y OTRAS ACTIVIDADES CULTURALES",
  },
  { value: "91010", label: "Actividades de bibliotecas y archivos" },
  {
    value: "91020",
    label:
      "Actividades de museos y preservación de lugares y edificios históricos",
  },
  {
    value: "91030",
    label:
      "Actividades de jardines botánicos, zoológicos y de reservas naturales",
  },
  { value: "92", label: "ACTIVIDADES DE JUEGOS DE AZAR Y APUESTAS" },
  { value: "92000", label: "Actividades de juegos y apuestas" },
  {
    value: "93",
    label: "ACTIVIDADES DEPORTIVAS, DE ESPARCIMIENTO Y RECREATIVAS",
  },
  { value: "93110", label: "Gestión de instalaciones deportivas" },
  { value: "93120", label: "Actividades de clubes deportivos" },
  { value: "93190", label: "Otras actividades deportivas" },
  {
    value: "93210",
    label: "Actividades de parques de atracciones y parques temáticos",
  },
  { value: "93291", label: "Discotecas y salas de baile" },
  { value: "93298", label: "Centros vacacionales" },
  { value: "93299", label: "Actividades de esparcimiento ncp" },
  { value: "S", label: "OTRAS ACTIVIDADES DE SERVICIOS" },
  { value: "94", label: "ACTIVIDADES DE ASOCIACIONES" },
  {
    value: "94110",
    label: "Actividades de organizaciones empresariales y de empleadores",
  },
  { value: "94120", label: "Actividades de organizaciones profesionales" },
  { value: "94200", label: "Actividades de sindicatos" },
  { value: "94910", label: "Actividades de organizaciones religiosas" },
  { value: "94920", label: "Actividades de organizaciones políticas" },
  { value: "94990", label: "Actividades de asociaciones n.c.p." },
  {
    value: "95",
    label:
      "REPARACIÓN DE COMPUTADORAS Y DE EFECTOS PERSONALES Y ENSERES DOMÉSTICOS",
  },
  { value: "95110", label: "Reparación de computadoras y equipo periférico" },
  { value: "95120", label: "Reparación de equipo de comunicación" },
  { value: "95210", label: "Reparación de aparatos electrónicos de consumo" },
  {
    value: "95220",
    label: "Reparación de aparatos doméstico y equipo de hogar y jardín",
  },
  { value: "95230", label: "Reparación de calzado y artículos de cuero" },
  { value: "95240", label: "Reparación de muebles y accesorios para el hogar" },
  { value: "95291", label: "Reparación de Instrumentos musicales" },
  { value: "95292", label: "Servicios de cerrajería y copiado de llaves" },
  { value: "95293", label: "Reparación de joyas y relojes" },
  {
    value: "95294",
    label: "Reparación de bicicletas, sillas de ruedas y rodados n.c.p.",
  },
  { value: "95299", label: "Reparaciones de enseres personales n.c.p." },
  { value: "96", label: "OTRAS ACTIVIDADES DE SERVICIOS PERSONALES" },
  {
    value: "96010",
    label:
      "Lavado y limpieza de prendas de tela y de piel, incluso la limpieza en seco",
  },
  { value: "96020", label: "Peluquería y otros tratamientos de belleza" },
  { value: "96030", label: "Pompas fúnebres y actividades conexas" },
  {
    value: "96091",
    label:
      "Servicios de sauna y otros servicios para la estética corporal n.c.p.",
  },
  { value: "96092", label: "Servicios n.c.p." },
  {
    value: "T",
    label:
      "ACTIVIDADES DE LOS HOGARES COMO EMPLEADORES, ACTIVIDADES INDIFERENCIADAS DE PRODUCCIÓN DE BIENES Y SERVICIOS DE LOS HOGARES PARA USO PROPIO",
  },
  {
    value: "97",
    label:
      "ACTIVIDAD DE LOS HOGARES EN CALIDAD DE EMPLEADORES DE PERSONAL DOMESTICO",
  },
  {
    value: "97000",
    label:
      "Actividad de los hogares en calidad de empleadores de personal doméstico",
  },
  {
    value: "98",
    label:
      "ACTIVIDADES INDIFERENCIADAS DE PRODUCCIÓN DE BIENES Y SERVICIOS DE LOS HOGARES PARA USO PROPIO",
  },
  {
    value: "98100",
    label:
      "Actividades indiferenciadas de producción de bienes de los hogares privados para uso propio",
  },
  {
    value: "98200",
    label:
      "Actividades indiferenciadas de producción de servicios de los hogares privados para uso propio",
  },
  {
    value: "U",
    label: "ACTIVIDADES DE ORGANIZACIONES Y ÓRGANOS EXTRATERRITORIALES",
  },
  {
    value: "99",
    label: "ACTIVIDADES DE ORGANIZACIONES Y ÓRGANOS EXTRATERRITORIALES",
  },
  {
    value: "99000",
    label: "Actividades de organizaciones y órganos extraterritoriales",
  },
  { value: "Z", label: "EMPLEADOS Y OTRAS PERSONAS NATURALES" },
  { value: "100", label: "EMPLEADOS Y OTRAS PERSONAS NATURALES" },
  { value: "10001", label: "Empleados" },
  { value: "10002", label: "Pensionado" },
  { value: "10003", label: "Estudiante" },
  { value: "10004", label: "Desempleado" },
  { value: "10005", label: "Otros" },
  { value: "10006", label: "Comerciante" },
];
