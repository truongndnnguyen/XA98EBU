
module Capybara::DSL

    def within_view(view)
      if view.respond_to?(:within_view_scope)
        view.within_view_scope do
          yield view if block_given?
        end
      else
        yield view if block_given?
      end
    end

    alias_method :within_page, :within_view

    def expect_view(view)
      within_view(view) do |view|
        expect(view).to be_current
      end
    end

    alias_method :expect_page, :expect_view

    def acquire_state(state_manager)
      state_manager.acquire_state
    end

    alias_method :given, :acquire_state

end
