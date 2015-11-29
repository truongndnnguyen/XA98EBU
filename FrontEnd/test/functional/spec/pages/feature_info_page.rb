module EMPublic
  module Pages

    def feature_info_page
      FeatureInfoPage.new
    end

    class FeatureInfoPage

      include Capybara::DSL

      def feature_info
        find('#featureModal')
      end
      def title
        feature_info.find('.modal-title')
      end
      def body
        feature_info.find('.modal-body')
      end
      def close_btn
        feature_info.find('.modal-header').find('.close')
      end

      def click_close_btn
        close_btn.click
      end

    end

  end
end
