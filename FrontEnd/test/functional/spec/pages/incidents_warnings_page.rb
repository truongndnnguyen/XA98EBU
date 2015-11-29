module EMPublic
  module Pages

    def incidents_warnings_page
      IncidentsWarningsPage.new
    end

    class IncidentsWarningsPage

      include Capybara::DSL

      def current?
        not find('h1').nil?
      end

      def toggle_drawer
        click_link 'More Information'
      end

      def zoom_in
        find('.leaflet-control-zoom-in').click
      end

      def zoom_out
        find('.leaflet-control-zoom-out').click
      end

      def zoom_state
        find('.leaflet-control-showall').find('a.leaflet-bar-part').click
      end

      def current_zoom_level
        evaluate_script('app.map.getZoom()');
      end

      def popup
        find('.leaflet-popup-content')
      end

    end

  end
end
