#!/usr/bin/env node
/**
 * DeepSeek API Diagnostic Tool
 * Tests multiple configurations to find what actually works
 */

const API_KEY = process.argv[2] || process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
    console.log('\n❌ Usage: node deepseek-diagnostic.js <your-deepseek-api-key>');
    console.log('   Or set DEEPSEEK_API_KEY environment variable\n');
    process.exit(1);
}

const TESTS = [
    {
        name: 'Test 1: Base URL with /v1, Model: deepseek-v4-pro',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-v4-pro'
    },
    {
        name: 'Test 2: Base URL without /v1, Model: deepseek-v4-pro',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-v4-pro'
    },
    {
        name: 'Test 3: Base URL with /v1, Model: deepseek-v4-flash',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-v4-flash'
    },
    {
        name: 'Test 4: Base URL without /v1, Model: deepseek-v4-flash',
        baseUrl: 'https://api.deepseek.com',
        model: 'deepseek-v4-flash'
    },
    {
        name: 'Test 5: Base URL with /v1, Model: deepseek-chat (legacy alias)',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
    },
    {
        name: 'Test 6: Base URL with /v1, Model: deepseek-reasoner (legacy alias)',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-reasoner'
    }
];

async function runTest(test) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`   Base URL: ${test.baseUrl}`);
    console.log(`   Model:    ${test.model}`);
    console.log(`${'='.repeat(60)}`);

    const url = test.baseUrl.endsWith('/v1') 
        ? `${test.baseUrl}/chat/completions`
        : `${test.baseUrl}/v1/chat/completions`;

    const startTime = Date.now();
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: test.model,
                messages: [
                    { role: 'user', content: 'Say exactly: "API test successful" and nothing else.' }
                ],
                max_tokens: 20
            })
        });

        const duration = Date.now() - startTime;
        const data = await response.json().catch(() => null);

        if (response.ok && data?.choices?.[0]?.message?.content) {
            const content = data.choices[0].message.content.trim();
            console.log(`✅ SUCCESS (${duration}ms)`);
            console.log(`   Response: "${content}"`);
            console.log(`   Model used: ${data.model || test.model}`);
            console.log(`   Usage: ${JSON.stringify(data.usage || {})}`);
            return { success: true, test, response: data };
        } else {
            console.log(`❌ FAILED (${duration}ms)`);
            console.log(`   HTTP Status: ${response.status} ${response.statusText}`);
            console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
            return { success: false, test, error: data };
        }
    } catch (err) {
        const duration = Date.now() - startTime;
        console.log(`❌ ERROR (${duration}ms)`);
        console.log(`   Message: ${err.message}`);
        return { success: false, test, error: err.message };
    }
}

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║     DeepSeek API Diagnostic Tool                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`\nTesting with API key: ${API_KEY.slice(0, 12)}...${API_KEY.slice(-4)}`);

    const results = [];
    for (const test of TESTS) {
        const result = await runTest(test);
        results.push(result);
        // Small delay between tests
        await new Promise(r => setTimeout(r, 500));
    }

    // Summary
    console.log('\n\n' + '═'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(60));

    const working = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    if (working.length === 0) {
        console.log('\n❌ NONE of the configurations worked.\n');
        console.log('Possible issues:');
        console.log('   1. API key is invalid or expired');
        console.log('   2. No credit balance on platform.deepseek.com');
        console.log('   3. DeepSeek API is temporarily down');
        console.log('   4. Network/firewall blocking the request\n');
    } else {
        console.log(`\n✅ ${working.length} configuration(s) worked:\n`);
        working.forEach(r => {
            console.log(`   ✓ ${r.test.name}`);
            console.log(`     Base URL: ${r.test.baseUrl}`);
            console.log(`     Model ID: ${r.test.model}`);
        });

        console.log(`\n❌ ${failed.length} configuration(s) failed`);
    }

    // Cline-specific recommendation
    if (working.length > 0) {
        const best = working[0];
        console.log('\n' + '─'.repeat(60));
        console.log('🎯 FOR CLINE: Use these exact settings:');
        console.log('─'.repeat(60));
        console.log(`   API Provider: OpenAI Compatible`);
        console.log(`   Base URL:     ${best.test.baseUrl}`);
        console.log(`   API Key:      (your DeepSeek key)`);
        console.log(`   Model ID:     ${best.test.model}`);
        console.log('─'.repeat(60));
    }

    console.log('\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
