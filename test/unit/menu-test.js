import Menu from 'view/controls/components/menu/menu';
import SettingsMenu from 'view/controls/components/menu/settings-menu';
import SimpleModel from 'model/simplemodel';
import MockApi from 'mock/mock-api';

const localization = { close: 'close', hd: 'quality', playbackRates: 'rates' };

describe('Menu', () => {
    let settingsMenu;
    beforeEach(() => {
        settingsMenu = new Menu('settings', null, localization);
    });

    it('properly constructs', () => {
        expect(typeof settingsMenu).to.equal('object');
        expect(settingsMenu.isSubmenu).to.be.false;
        expect(!settingsMenu.parentMenu).to.be.true;
        expect(settingsMenu.name).to.equal('settings');
        expect(Object.keys(settingsMenu.children).length).to.equal(0);
        expect(!settingsMenu.categoryButton).to.be.true;
        expect(typeof settingsMenu.open).to.equal('function');
        expect(typeof settingsMenu.close).to.equal('function');
        expect(typeof settingsMenu.toggle).to.equal('function');
    });

    it('appends a child menu', () => {
        const childMenu = new Menu('quality', settingsMenu, localization);

        expect(childMenu.parentMenu.name).to.equal('settings');
        expect(childMenu.mainMenu.name).to.equal('settings');
        expect(!!settingsMenu.children[childMenu.name]).to.be.true;
    });

    it('removes a child menu', () => {
        const childMenu = new Menu('quality', settingsMenu, localization);

        settingsMenu.removeMenu('quality');
        expect(Object.keys(settingsMenu.children).length).to.equal(0);
        expect(!childMenu.parentMenu).to.equal(true);
    });

    it('opens', () => {
        const childMenu = new Menu('quality', settingsMenu, localization);
        expect(childMenu.visible).to.be.false;
        expect(settingsMenu.visible).to.be.false;
        // Mock items and set to menu
        childMenu.setMenuItems(childMenu.createItems(
            [
                { label: 'Auto' }, 
                { label: '1080p' }
            ],
            () => {},
            { defaultText: 'off' }
        ));
        
        childMenu.open();
        expect(childMenu.visible).to.be.true;
        // Parent menu opens when child is opened.
        expect(settingsMenu.visible).to.be.true;
    });
    it('closes', () => {
        const childMenu = new Menu('quality', settingsMenu, localization);
        expect(childMenu.visible).to.be.false;
        expect(settingsMenu.visible).to.be.false;
        // Mock items and set to menu
        childMenu.setMenuItems(childMenu.createItems(
            [
                { label: 'Auto' }, 
                { label: '1080p' }
            ],
            () => {},
            { defaultText: 'off' }
        ));
        
        childMenu.open();
        childMenu.close();
        expect(childMenu.visible).to.be.false;
        // Parent menu closes when only child closes.
        expect(settingsMenu.visible).to.be.false;
    });
});

describe('Settings Menu', () => {
    let viewModel;
    let settingsMenu;
    let api;
    
    beforeEach(function() {
        viewModel = new SimpleModel();
        api = MockApi;
    });

    it('should setup quality menu on levels change', function() {
        settingsMenu = SettingsMenu(api, viewModel, localization);
        expect(!!settingsMenu.children.quality).to.be.false;
        viewModel.set('levels', [{ label: 'Auto' }, { label: '1080p' }]);
        expect(!!settingsMenu.children.quality).to.be.true;
    });

    it('should setup captions menu on captions change', function() {
        settingsMenu = SettingsMenu(api, viewModel, localization);
        expect(!!settingsMenu.children.captions).to.be.false;
        viewModel.set('captionsList', [
            { id: 'off', label: 'Off' },
            { id: 'test', label: 'English' }
        ]);
        expect(!!settingsMenu.children.captions).to.be.true;
    });

    it('should setup playback rates menu on playback rates if configured', () => {
        settingsMenu = SettingsMenu(api, viewModel, localization);
        viewModel.set('playbackRates', [0.5, 1, 1.25, 1.5, 2]);
        expect(!!settingsMenu.children.playbackRates).to.be.false;
        viewModel.set('supportsPlaybackRate', true);
        viewModel.set('playbackRateControls', true);
        expect(!!settingsMenu.children.playbackRates).to.be.true;
    });

    it('should set up audio tracks menu on audio tracks change if multiple tracks', () => {
        const track = {
            autoselect: false,
            defaulttrack: false,
            groupid: 'default',
            language: 'en',
            name: 'English',
            shakaIndex: 0,
            shakaId: 32
        };
        settingsMenu = SettingsMenu(api, viewModel, localization);
        viewModel.set('audioTracks', [track]);
        expect(!!settingsMenu.children.audioTracks).to.be.false;
        viewModel.set('audioTracks', [track, track]);
        expect(!!settingsMenu.children.audioTracks).to.be.true;
    });

    it('Emits an event when a submenu is added', () => {
        settingsMenu = SettingsMenu(api, viewModel, localization);
        settingsMenu.trigger = sinon.spy();
        viewModel.set('levels', [{ label: 'Auto' }, { label: '1080p' }]);
        expect(settingsMenu.trigger.calledWith('menuAppended')).to.equal(true);
    });

    it('Emits an event when a submenu is removed', () => {
        settingsMenu = SettingsMenu(api, viewModel, localization);
        settingsMenu.trigger = sinon.spy();
        viewModel.set('levels', [{ label: 'Auto' }, { label: '1080p' }]);
        viewModel.set('levels', [{ label: 'Auto' }]);
        expect(settingsMenu.trigger.calledWith('menuRemoved')).to.equal(true);
    });
});
