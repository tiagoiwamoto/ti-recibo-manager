create table if not exists clients (
    id text primary key,
    name text not null,
    document text not null unique,
    document_type text not null,
    rg text,
    birth_date text,
    driver_license text,
    address text not null,
    city text not null,
    state text,
    postal_code text,
    country text,
    notes text
);

create table if not exists receipts (
    id text primary key,
    receipt_type text not null,
    amount decimal(12,2) not null,
    payer_name text not null,
    payer_document text not null,
    payer_document_type text not null,
    amount_in_words text not null,
    reference text not null,
    notes text,
    issue_date text not null,
    place text not null,
    issue_date_text text not null,
    receiver_name text not null,
    receiver_document text not null,
    receiver_document_type text not null
);

create table if not exists app_config (
    id integer primary key,
    issuer_name text not null,
    issuer_document text not null,
    issuer_document_type text not null,
    city text not null,
    logo_path text,
    receipt_template text not null
);
