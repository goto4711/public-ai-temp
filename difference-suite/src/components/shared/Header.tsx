import { Search, Bell } from 'lucide-react';
import { useSuiteStore } from '../../stores/suiteStore';

const Header = () => {
    return (
        <div className="h-[90px] bg-white border-b border-[rgba(0,0,0,0.05)] px-8 flex items-center justify-between z-20 sticky top-0">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
                <img
                    src="https://deep-culture.org/wp-content/themes/deepculture/img/deep-culture-logo.png"
                    alt="Deep Culture"
                    className="h-12 w-auto"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="btn-icon">
                    <Search className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-text">Admin User</div>
                        <div className="text-xs text-text-muted">Editor</div>
                    </div>
                    <img
                        src="https://ui-avatars.com/api/?name=Admin+User&background=832161&color=fff"
                        alt="Admin"
                        className="w-10 h-10 rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
