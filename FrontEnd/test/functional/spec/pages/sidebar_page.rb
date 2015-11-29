module EMPublic
  module Pages

    def sidebar_page
      SidebarPage.new
    end

    class SidebarPage

      include Capybara::DSL

      def sidebar
        find('#sidebar')
      end
      def filter_btn
        first('#filter-dropdown-btn')
      end
      def filter_menu
        first('#filter-dropdown-list')
      end
      def warning_feature_list
        sidebar.find('#feature-list-tab-0')
      end
      def incident_feature_list
        sidebar.find('#feature-list-tab-1')
      end
      def map_view_btn
        find('#mobile-sidebar-map-btn', :visible => true)
      end
      def list_view_btn
        find('#mobile-sidebar-list-btn', :visible => true)
      end
      def both_view_btn
        find('#mobile-sidebar-both-btn', :visible => true)
      end
      def textonly_toggle_btn
        find('#mobile-sidebar-list-btn')
      end
      def search_btn
        sidebar.find('#search-show-btn')
      end

      def switch_to_map_view
        map_view_btn.click
      end
      def switch_to_list_view
        list_view_btn.click
      end
      def switch_to_both_view
        both_view_btn.click
      end

      def sidebar_visible?(state)
        sidebar.find('.sidebar-table', :visible => state)
      end

      def search
        search_btn.click
      end

      def click_incident_list
        sidebar.find('#feature-list-tab-link-1').click
      end

      def click_warning_list
        sidebar.find('#feature-list-tab-link-0').click
      end

      def click_feature(id)
        sidebar.find(:xpath, '//tr[@data-href="'+id+'"]').first('td', :visible => true).first('div.sidebar-feature-link').click
      end

      def click_feature_moreinfo(id)
        sidebar.find(:xpath, '//tr[@data-href="'+id+'"]').first('td', :visible => true).first('a.osom-table-popup-details').click
      end

      def toggle_textonly
        textonly_toggle_btn.click
      end

      def textonly_visible?(state)
        find('#map', :visible => !state)
      end

      def toggle_filter_by(cat)
        filter_btn.click
        filter_menu.find_field(cat).click
        filter_btn.click
      end

    end

  end
end
