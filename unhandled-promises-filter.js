process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason);
    reason.message = 'unhandledRejection';
    throw reason;
    process.exit(1);
});
