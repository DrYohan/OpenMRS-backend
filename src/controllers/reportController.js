const jsreport = require('jsreport-core')();

let initPromise = null;

const initReporter = async () => {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log('🔄 Initializing jsreport...');
            jsreport.use(require('jsreport-handlebars')());
            jsreport.use(require('jsreport-chrome-pdf')({
                launchOptions: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                }
            }));
            
            // Try to include xlsx/docx if they were installed
            try {
                jsreport.use(require('jsreport-html-to-xlsx')());
            } catch (e) {
                console.warn('jsreport-html-to-xlsx not found');
            }

            try {
                jsreport.use(require('jsreport-html-to-docx')());
            } catch (e) {
                console.warn('jsreport-html-to-docx not found');
            }

            await jsreport.init();
            console.log('✅ jsreport initialized successfully');
            return jsreport;
        } catch (error) {
            console.error('❌ Failed to initialize jsreport:', error);
            initPromise = null; // Reset for retry
            throw error;
        }
    })();

    return initPromise;
};

// Start initialization immediately
initReporter().catch(err => console.error('Initial jsreport boot failed:', err));

const ReportController = {
    async generateReport(req, res) {
        try {
            const { template, data } = req.body;
            console.log(`Generating report: recipe=${template.recipe}`);
            console.log(`Data items count: ${data?.assets?.length || 0}`);

            const reporter = await initReporter();
            
            // Handlebars template needs data.assets to match {{#each assets}}
            const result = await reporter.render({
                template: {
                    ...template,
                    engine: 'handlebars'
                },
                data: data
            });

            console.log(`Report generated successfully: ${result.meta.contentType}`);

            res.setHeader('Content-Type', result.meta.contentType);
            // Convert result.content (buffer) to buffer explicitely if needed, but jsreport returns a buffer
            res.send(result.content);
        } catch (error) {
            console.error('Report Generation Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate report',
                error: error.message,
                stack: error.stack
            });
        }
    }
};

module.exports = ReportController;
