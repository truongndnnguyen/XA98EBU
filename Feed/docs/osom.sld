<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor version="1.0.0"
    xmlns:sld="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">

  <sld:NamedLayer>
    <sld:Name>default</sld:Name>
    <sld:UserStyle>
      <sld:Name>Default</sld:Name>
      <sld:IsDefault>1</sld:IsDefault>
      <sld:FeatureTypeStyle>

        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>evacuate</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/warning/Evacuate.svg" />
                <sld:Format>image/svg</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>emergency</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/warning/Emergency_Warning.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>watchact</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/warning/Warning-Watch_and_Act.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>advice</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/warning/Advice.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>community_update</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/warning/Community_Update.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>fire-active</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Fire_Active.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>fire-inactive</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Fire.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>


        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>planned_burn</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Planned_Burn.svg" />
                <sld:Format>image/svg</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>


        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>hazmat</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Hazardous_Material.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>ar-aircraft</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Aircraft_Incident.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>ar-rail</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Rail_Incident.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>ar-rescue</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Rescue.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>ar-road</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Accident_Collision.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>catg1CssClass</ogc:PropertyName><ogc:Literal>medical</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Health.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Tree Down</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Tree_Hazard.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Building Damage</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Tree_Hazard.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Flooding</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Tree_Hazard.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Earthquake</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Tree_Hazard.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Weather</ogc:Literal></ogc:PropertyIsEqualTo>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category2</ogc:PropertyName><ogc:Literal>Severe Weather</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Severe_Weather.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Weather</ogc:Literal></ogc:PropertyIsEqualTo>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category2</ogc:PropertyName><ogc:Literal>Thunderstorm</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Severe_Weather.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Weather</ogc:Literal></ogc:PropertyIsEqualTo>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category2</ogc:PropertyName><ogc:Literal>Damaging</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Damaging_Winds.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Weather</ogc:Literal></ogc:PropertyIsEqualTo>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category2</ogc:PropertyName><ogc:Literal>Cyclone</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Cyclone.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Tsunami</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Tsunami.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Landslide</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Landslide.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Power Line</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Fallen_Power_Lines.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>

        <sld:Rule>
          <ogc:Filter><ogc:And>
	      <ogc:PropertyIsEqualTo><ogc:PropertyName>category1</ogc:PropertyName><ogc:Literal>Tree Down Traffic Hazard</ogc:Literal></ogc:PropertyIsEqualTo>
	  </ogc:And></ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Tree_Hazard.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>



        <sld:Rule>
          <sld:ElseFilter/>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xlink:href="http://cop.em.vic.gov.au/sadisplay/img/markers/public/incident/Other_Incident.svg" />
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Opacity>1.0</sld:Opacity>
              <sld:Size>30</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
  
</sld:StyledLayerDescriptor>
