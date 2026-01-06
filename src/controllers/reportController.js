const jsreport = require('@jsreport/jsreport-core')();

let initPromise = null;

const initReporter = async () => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log('🔄 Initializing jsreport v4...');
            
            // Core plugins
            jsreport.use(require('@jsreport/jsreport-handlebars')());
            jsreport.use(require('@jsreport/jsreport-chrome-pdf')({
                launchOptions: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                }
            }));
            
            // Optional plugins
            try {
                jsreport.use(require('@jsreport/jsreport-html-to-xlsx')());
                console.log('✅ xlsx plugin loaded');
            } catch (e) {
                console.warn('⚠️ xlsx plugin not found');
            }

            try {
                jsreport.use(require('@jsreport/jsreport-html-to-docx')());
                console.log('✅ docx plugin loaded');
            } catch (e) {
                console.warn('⚠️ docx plugin not found');
            }
            
            await jsreport.init();
            console.log('✅ jsreport v4 initialized successfully');
            return jsreport;
        } catch (error) {
            console.error('❌ Failed to initialize jsreport:', error);
            initPromise = null;
            throw error;
        }
    })();

    return initPromise;
};

// Start initialization
initReporter().catch(err => console.error('Initial jsreport boot failed:', err));

const ReportController = {
    async generateReport(req, res) {
        try {
            const { template, data } = req.body;
            console.log(`[Report] Recipe: ${template.recipe} | Assets: ${data?.assets?.length || 0}`);

            const reporter = await initReporter();
            
            // Configure PDF for Landscape and high quality
            const chromeOptions = {
                landscape: true,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '1cm',
                    bottom: '1cm',
                    left: '1cm',
                    right: '1cm'
                }
            };

            const renderOptions = {
                template: {
                    content: template.content,
                    recipe: template.recipe,
                    engine: 'handlebars'
                },
                data: data
            };

            // Only add chrome options if it's a PDF recipe
            if (template.recipe === 'chrome-pdf') {
                renderOptions.template.chrome = chromeOptions;
            }

            const result = await reporter.render(renderOptions);

            console.log(`[Report] Sending ${result.content.length} bytes | Type: ${result.meta.contentType}`);

            res.setHeader('Content-Type', result.meta.contentType);
            res.setHeader('Content-Length', result.content.length);
            res.setHeader('Content-Disposition', `attachment; filename="Report_${Date.now()}.${result.meta.fileExtension}"`);
            
            res.status(200).send(result.content);
            
        } catch (error) {
            console.error('[Report] Error during generation:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate report correctly.',
                error: error.message
            });
        }
    }
};

module.exports = ReportController;
