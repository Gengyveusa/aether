import streamlit as st
import json
import sys
import os

# Ensure the core module can be imported when running on Streamlit Cloud
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.geo import compute_geo_score

st.title("GEo Score Dashboard")
uploaded_file = st.file_uploader("Upload JSON data", type=["json"])
if uploaded_file is not None:
    data = json.load(uploaded_file)
    result = compute_geo_score(data)
    st.subheader("Results")
    st.json(result)
