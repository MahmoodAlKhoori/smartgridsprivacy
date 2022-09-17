FROM rust:1.61-bullseye

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . ~/.bashrc \
    && nvm install 16.17 \
    && corepack enable
RUN curl -sSfL https://release.solana.com/v1.14.2/install | bash \
    && . ~/.profile \
    && solana-keygen new --no-bip39-passphrase
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.25.0 avm --locked --force \
    && avm install 0.25.0
RUN echo 'PATH="$PATH:/usr/local/cargo/bin"' >> ~/.bashrc

WORKDIR /code

CMD tail -f /dev/null
