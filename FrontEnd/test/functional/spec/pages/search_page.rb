module EMPublic
  module Pages

    def search_page
      SearchPage.new
    end

    class SearchPage

      include Capybara::DSL

      def search_visible?(state)
        find('#searchModal', :visible => state)
      end

      def search_vicmap_for text
        find('#search-terms').set text
        find('#search-perform-btn').click
      end

      def search_google_for text
        find('#search-terms').set text
        find('#search-perform-google-btn').click
      end

      def search_results
        find('#search-results')
      end

    end

  end
end
